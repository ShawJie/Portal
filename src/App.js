const { URL } = require('url');
const axios = require('axios');
const yaml = require('yaml');
const fs = require('fs');
const nodeCron = require('node-cron');
const logger = require('./Logger');
const config = require('../config.json');

const express = require('express');

const AggregationProxy = require('./entry/AggergationProxy');
const PortalConfigurationProperty = require('./config/PortalConfigurationProperty');

class AppCore {
    
    static #basicAuthFilePath = "auth/.htpasswd";

    constructor(addOnConfig, port = 8080) {
        let property = new PortalConfigurationProperty(addOnConfig);
        let aggProxy = new AggregationProxy(property);

        this.property = property;
        this.aggProxy = aggProxy;
        this.accessControlMap = null;

        this.port = port;
        this.server = null;
    }

    getDomainHost() {
        return this.property.host;
    }

    getDomainHostWithAuth(userinfo) {
        let domainUrl = new URL(this.property.host);
        if (userinfo) {
            domainUrl.username = userinfo.username;
            domainUrl.password = userinfo.password;
        }
        
        return domainUrl.toString();
    }

    accessControl() {
        return this.property.accessControl;
    }

    #refreshAccessControlMap() {
        let htpasswdResource = fs.readFileSync(AppCore.#basicAuthFilePath, "utf-8")
            .split(/\r?\n/).filter(line => line.trim() != '')
            .map(line => line.split(":"))
            .map(([user, pass]) => [user, pass.trim()])
            .reduce((map, [user, pass]) => map.set(user, pass), new Map());
        this.accessControlMap = htpasswdResource;
        logger.info('access control map refreshed');
    }

    inAccessSet({username, password}) {        
        if (this.accessControlMap.has(username)) {
            let except = this.accessControlMap.get(username);
            logger.debug('user found in access control map, %s => inbound: %s, except: %s', username, password, except);
            return password === except;
        }
        logger.warn('user not found in access control map, %s', username);
        return false;
    }

    #isLoaded() {
        return !this.aggProxy.isEmpty();
    }

    #postProcessProxyList(pulledProxies) {
        let {proxys, include, exclude} = this.property;
        let filterLogic = ({name}) => {
            if (include) {
                return new RegExp(include).test(name);
            }
            return !(new RegExp(exclude).test(name));
        }

        let processedProxies = pulledProxies.filter(e => filterLogic(e));
        processedProxies.push(...proxys);

        return processedProxies;
    }

    async #loadConfigFromPath() {
        let path = this.property.basePath;
        let afterProxy = null;
        if (path) {
            afterProxy = await axios.get(path).then((res) => {
                let document = yaml.parse(res.data);
                return this.#extraClashConfig(document);
            }).then((proxys) => {
                return this.#postProcessProxyList(proxys);
            });
        } else {
            afterProxy = this.#postProcessProxyList([]);
        }

        for (const proxy of afterProxy) {
            this.aggProxy.addProxy(proxy);
        }
    }

    #extraClashConfig(document) {
        let proxys = document?.proxies;
        if (!proxys || proxys.length == 0) {
            throw new Error('load config failed, no proxies found');
        }
        return proxys;
    }

    async getProxies(refresh = false) {
        if (this.#isLoaded() && !refresh) {
            return this.aggProxy;
        }

        this.aggProxy.refresh();
        await this.#loadConfigFromPath();
        return this.aggProxy;
    }

    async run() {
        if (!this.server) {
            this.server = express();
        }

        if (!this.property.logLevel !== 'info') {
            logger.level = this.property.logLevel;
        }

        if (this.property.accessControl) {
            logger.info('access control enabled');
            this.#refreshAccessControlMap();
            fs.watchFile(AppCore.#basicAuthFilePath, () => {
                logger.info('htpasswd file changed, refreshing access control map...');
                this.#refreshAccessControlMap();
            });
        }

        await this.getProxies();
        const server = this.server.listen(this.port, () => {
            let {address, port} = server.address();
            logger.info(`service started, domain: http://${address}:${port}`);
        });

        nodeCron.schedule(this.property.refreshCron, async () => {
            logger.info('refreshing proxy list...');
            await this.getProxies(true);
            logger.info('refreshing proxy list finished');
        });

        
        return this.server;
    }
}

const app = new AppCore(config);
module.exports = app;