import { URL } from 'url';
import axios from 'axios';
import yaml from 'yaml';
import fs from 'fs';
import nodeCron from 'node-cron';
import logger from './Logger';

import express, { type Express } from 'express';

import AggregationProxy from './entry/AggergationProxy';
import PortalConfigurationProperty from './config/PortalConfigurationProperty';
import type { PortalConfig } from './types/config';
import type { ClashProxy, PluginOpts } from './types/proxy';
import type { AggregatedResource } from './types/group';
import type { AccessUser } from './types/context';

interface RawClashProxy {
    [key: string]: unknown;
}

interface ClashDocument {
    proxies?: RawClashProxy[];
}

class AppCore {
    
    static readonly #basicAuthFilePath = "auth/.htpasswd";

    private property: PortalConfigurationProperty;
    private aggProxy: AggregationProxy;
    private accessControlMap: Map<string, string> | null;
    private port: number;
    private server: Express | null;

    constructor(addOnConfig: PortalConfig, port: number = 8080) {
        const property = new PortalConfigurationProperty(addOnConfig);
        const aggProxy = new AggregationProxy(property);

        this.property = property;
        this.aggProxy = aggProxy;
        this.accessControlMap = null;

        this.port = port;
        this.server = null;
    }

    getDomainHost(): string {
        return this.property.host;
    }

    getDomainHostWithAuth(userinfo?: AccessUser): string {
        const domainUrl = new URL(this.property.host);
        if (userinfo) {
            domainUrl.username = userinfo.username;
            domainUrl.password = userinfo.password;
        }
        
        return domainUrl.toString();
    }

    accessControl(): boolean {
        return this.property.accessControl;
    }

    private refreshAccessControlMap(): void {
        const htpasswdResource = fs.readFileSync(AppCore.#basicAuthFilePath, "utf-8")
            .split(/\r?\n/).filter(line => line.trim() !== '')
            .map(line => line.split(":"))
            .map(([user, pass]) => [user, pass.trim()] as [string, string])
            .reduce((map, [user, pass]) => map.set(user, pass), new Map<string, string>());
        this.accessControlMap = htpasswdResource;
        logger.info('access control map refreshed');
    }

    inAccessSet({username, password}: AccessUser): boolean {
        if (this.accessControlMap!.has(username)) {
            const except = this.accessControlMap!.get(username)!;
            logger.debug('user found in access control map, %s => inbound: %s, except: %s', username, password, except);
            return password === except;
        }
        logger.warn('user not found in access control map, %s', username);
        return false;
    }

    private isLoaded(): boolean {
        return !this.aggProxy.isEmpty();
    }

    private postProcessProxyList(pulledProxies: ClashProxy[]): ClashProxy[] {
        const {proxys, include, exclude} = this.property;
        const filterLogic = ({name}: ClashProxy): boolean => {
            if (include) {
                return new RegExp(include).test(name);
            }
            return !(new RegExp(exclude || '').test(name));
        };

        const processedProxies = pulledProxies
            .filter(e => filterLogic(e));
        processedProxies.push(...proxys);

        return processedProxies;
    }

    private async loadConfigFromPath(): Promise<ClashProxy[]> {
        const sourcePaths = this.property.sourcePaths;
        let afterProxy: ClashProxy[];
        if (sourcePaths && sourcePaths.length > 0) {
            const allProxies = await Promise.all(
                sourcePaths.map(({name, url}) => 
                    axios.get(url, {headers: {'User-Agent': 'mihomo.party/v1.9.3(clash.meta)'}})
                        .then((res) => {
                            const document: ClashDocument = yaml.parse(res.data);
                            return this.extraClashConfig(document, name);
                        })
                        .catch((err: Error) => {
                            logger.error(`Failed to load config from ${url}: ${err.message}`);
                            return [] as ClashProxy[];
                        })
                )
            );
            afterProxy = this.postProcessProxyList(allProxies.flat());
        } else {
            afterProxy = this.postProcessProxyList([]);
        }

        return afterProxy;
    }

    private static normalizeRawProxy(raw: RawClashProxy): ClashProxy {
        return {
            name: raw.name as string,
            type: raw.type as ClashProxy['type'],
            server: raw.server as string,
            port: raw.port as number,
            password: raw.password as string | undefined,
            cipher: raw.cipher as string | undefined,
            udp: raw.udp as boolean | undefined,
            tls: raw.tls as boolean | undefined,
            sni: raw.sni as string | undefined,
            ws: raw.ws as boolean | undefined,
            wsPath: (raw['ws-path'] ?? raw.wsPath) as string | undefined,
            wsHeaders: (raw['ws-headers'] ?? raw.wsHeaders) as string | undefined,
            skipCertVerify: (raw['skip-cert-verify'] ?? raw.skipCertVerify) as boolean | undefined,
            uuid: raw.uuid as string | undefined,
            username: raw.username as string | undefined,
            vmessAead: (raw['vmess-aead'] ?? raw.vmessAead) as boolean | undefined,
            plugin: raw.plugin as string | undefined,
            pluginOpts: (raw['plugin-opts'] ?? raw.pluginOpts) as PluginOpts | undefined,
            reuse: raw.reuse as boolean | undefined,
        };
    }

    private extraClashConfig(document: ClashDocument, sourceName: string | null = null): ClashProxy[] {
        const rawProxies = document?.proxies;
        if (!rawProxies || rawProxies.length === 0) {
            throw new Error('load config failed, no proxies found');
        }

        let proxys = rawProxies.map(AppCore.normalizeRawProxy);
        if (sourceName) {
            proxys = proxys.map(e => {
                e.name += `|${sourceName}`;
                return e;
            });
        }

        return proxys;
    }

    async getProxies(refresh: boolean = false): Promise<AggregatedResource> {
        if (this.isLoaded() && !refresh) {
            return this.aggProxy.resource();
        }

        await this.loadConfigFromPath()
            .then((proxies) => this.aggProxy.refresh(proxies));
        return this.aggProxy.resource();
    }

    async run(): Promise<Express> {
        if (!this.server) {
            this.server = express();
        }

        if (this.property.logLevel !== 'info') {
            logger.level = this.property.logLevel;
        }

        if (this.property.accessControl) {
            logger.info('access control enabled');
            this.refreshAccessControlMap();
            fs.watchFile(AppCore.#basicAuthFilePath, () => {
                logger.info('htpasswd file changed, refreshing access control map...');
                this.refreshAccessControlMap();
            });
        }

        await this.getProxies();
        const server = this.server.listen(this.port, () => {
            const addr = server.address();
            if (addr && typeof addr !== 'string') {
                logger.info(`service started, domain: http://${addr.address}:${addr.port}`);
            }
        });

        nodeCron.schedule(this.property.refreshCron, async () => {
            logger.info('refreshing proxy list...');
            await this.getProxies(true);
            logger.info('refreshing proxy list finished');
        });

        return this.server;
    }
}


const app = new AppCore(
    JSON.parse(fs.readFileSync("config.json", "utf-8")) as PortalConfig
);
export default app;
