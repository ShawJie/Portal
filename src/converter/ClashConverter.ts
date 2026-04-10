import yaml from 'yaml';
import app from "../App";
import BaseConverter from "./BaseConverter";
import { ProxyGroupType } from "../types/group";
import type { AggregatedResource } from "../types/group";
import type { ClashProxy } from "../types/proxy";
import type { ProxyGroup } from "../entry/Grouper";
import type { ConvertContext } from "../types/context";

export default class ClashConverter extends BaseConverter {

    static #autoRouter = {
        url: 'http://www.gstatic.com/generate_204',
        interval: 300,
    };

    static #clashConfigTemplate = {
        mixedPort: 7890,
        socksPort: 7891,
        redirPort: 7892,
        allowLan: false,
        bindAddress: '*',
        mode: 'rule',
        logLevel: 'silent',
        externalController: '0.0.0.0:9090',
        secret: '',
        proxies: [] as Record<string, unknown>[],
        proxyGroups: [] as Record<string, unknown>[],
        rules: [] as string[],
        dns: {
            defaultNameserver: ['223.5.5.5', '119.29.29.29', '114.114.114.114'],
            enable: true,
            enhancedMode: 'fake-ip',
            fakeIpRange: '198.18.0.1/16',
            fallback: ['1.1.1.1', '8.8.8.8'],
            fallbackFilter: {
                domain: ['+.google.com', '+.facebook.com', '+.youtube.com'],
                geoip: true,
                geoipCode: 'CN',
                geosite: ['gfw'],
                ipcidr: ['240.0.0.0/4']
            },
            ipv6: false,
            nameserver: ['223.5.5.5', '119.29.29.29', '114.114.114.114'],
            proxyServerNameserver: ['223.5.5.5', '119.29.29.29', '114.114.114.114'],
            respectRules: true,
            useHosts: true
        }
    };

    constructor() {
        super('clash-config.yaml');
    }

    async export(_context: ConvertContext): Promise<string> {
        const aggProxy = await app.getProxies();
        return this.fillTemplate(aggProxy);
    }

    private convert2KebabizeObj(target: unknown): unknown {
        if (typeof target !== 'object' || target === null) {
            return target;
        }

        const tmpObj: Record<string, unknown> = {};
        for (const key in target as Record<string, unknown>) {
            const nKey = this._kebabize(key);
            const val = (target as Record<string, unknown>)[key];
            if (typeof val === 'object' && val !== null) {
                if (Array.isArray(val)) {
                    const objArray: unknown[] = [];
                    for (const item of val) {
                        objArray.push(this.convert2KebabizeObj(item));
                    }
                    tmpObj[nKey] = objArray;
                } else {
                    tmpObj[nKey] = this.convert2KebabizeObj(val);
                }
            } else {
                tmpObj[nKey] = val;
            }
        }
        return tmpObj;
    }

    private fillTemplateProxies(template: { proxies: Record<string, unknown>[] }, proxies: Map<string, ClashProxy>): void {
        for (const [, proxy] of proxies) {
            template.proxies.push(proxy as unknown as Record<string, unknown>);
        }
    }

    private processGroup(groups: string[], proxies: ClashProxy[]): string[] {
        const outbounds: string[] = [];
        if (groups && groups.length > 0) {
            outbounds.push(...groups);
        }
        if (proxies && proxies.length > 0) {
            outbounds.push(...proxies.map(p => p.name));
        }
        return outbounds;
    }

    private fillTemplateGroups(
        template: { proxyGroups: Record<string, unknown>[]; rules: string[] },
        groups: ProxyGroup[],
        finalGroupProc: (group: ProxyGroup) => void
    ): void {
        for (const group of groups) {
            const groupContent: Record<string, unknown> = {
                name: group.name,
                type: group.type
            };

            switch (group.type) {
                case ProxyGroupType.URL_TEST:
                    groupContent.url = ClashConverter.#autoRouter.url;
                    groupContent.interval = ClashConverter.#autoRouter.interval;
                // falls through
                case ProxyGroupType.SELECT:
                    groupContent.proxies = this.processGroup(group.groups, group.proxies);
                    break;
                case ProxyGroupType.DIRECT:
                    groupContent.proxies = ['DIRECT'];
                    groupContent.type = 'select';
                    break;
                case ProxyGroupType.BLOCK:
                    groupContent.proxies = ['REJECT', 'DIRECT'];
                    groupContent.type = 'select';
                    break;
            }

            template.proxyGroups.push(groupContent);

            if (group.rules && group.rules.length > 0) {
                group.rules.map(r => `${r.type},${r.keyword},${group.name}`)
                    .forEach(r => template.rules.unshift(r));
            }
        }

        return finalGroupProc(groups.filter(g => g.final)[0]);
    }

    private fillTemplate(aggreProxy: AggregatedResource): string {
        const clashConfig = this._clone(ClashConverter.#clashConfigTemplate);

        this.fillTemplateProxies(clashConfig, aggreProxy.proxies);
        this.fillTemplateGroups(clashConfig, aggreProxy.groups, finalGroup => {
            clashConfig.rules.push('GEOIP,CN,DIRECT');
            clashConfig.rules.push(`MATCH,${finalGroup.name}`);
        });

        return yaml.stringify(this.convert2KebabizeObj(clashConfig), {
            defaultKeyType: 'PLAIN',
            defaultStringType: 'QUOTE_DOUBLE'
        });
    }
}
