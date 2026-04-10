import app from "../App";
import BaseConverter from "./BaseConverter";
import { ProxyGroupType } from "../types/group";
import type { AggregatedResource } from "../types/group";
import type { ClashProxy } from "../types/proxy";
import type { ProxyGroup, ProxyRule } from "../entry/Grouper";
import type { ConvertContext } from "../types/context";
import SingboxConfigurationCore from "./singbox/SingboxConfigurationCore";

interface SingboxGroupWrapper {
    name: string;
    type: string;
    outbounds: string[];
    rules?: {type: string; keyword: string}[];
}

export default class SingboxConverter extends BaseConverter {

    static readonly #ruleTypeKeyMap: Record<string, string> = {
        "DOMAIN": "domain",
        "DOMAIN-SUFFIX": "domainSuffix",
        "DOMAIN-KEYWORD": "domainKeyword",
        "IP-CIDR": "ip_cidr",
    };

    static readonly #versionTakePattern = new RegExp("SFI/(?<version>[0-9\\.]+)");

    constructor() {
        super('singbox.json');
    }

    async export({ua}: ConvertContext): Promise<string> {
        const matcher = ua.match(SingboxConverter.#versionTakePattern);
        if (matcher) {
            const {version} = matcher.groups!;
            if (!this.versionThreshold(version)) {
                return `sing-box version (${version}) is to old, not support anymore`;
            }
        }
        const aggProxy = await app.getProxies();
        return this.fillTemplate(aggProxy);
    }

    private versionThreshold(version: string): boolean {
        const lessVersion = [1, 13];
        
        const versionSplited = version.split('.').map(e => parseInt(e));
        while (lessVersion.length > 0) {
            const cur = lessVersion.shift()!;
            const curVersion = versionSplited.shift();
            if (curVersion === undefined || curVersion < cur) {
                return false;
            }
        }
        return true;
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

    private convert2UnderLineObj(target: unknown): unknown {
        if (typeof target !== 'object' || target === null) {
            return target;
        }

        const tmpObj: Record<string, unknown> = {};
        for (const key in target as Record<string, unknown>) {
            const nKey = this._underlinize(key);
            const val = (target as Record<string, unknown>)[key];
            if (typeof val === 'object' && val !== null) {
                if (Array.isArray(val)) {
                    const objArray: unknown[] = [];
                    for (const item of val) {
                        objArray.push(this.convert2UnderLineObj(item));
                    }
                    tmpObj[nKey] = objArray;
                } else {
                    tmpObj[nKey] = this.convert2UnderLineObj(val);
                }
            } else {
                tmpObj[nKey] = val;
            }
        }
        return tmpObj;
    }

    private groupWrapperProvider(group: ProxyGroup): SingboxGroupWrapper {
        const groupWrapper: SingboxGroupWrapper = {
            name: group.name,
            outbounds: [...this.processGroup(group.groups, group.proxies)],
            type: ''
        };

        switch(group.type) {
            case ProxyGroupType.URL_TEST:
                groupWrapper.type = "urltest";
                break;
            case ProxyGroupType.SELECT:
                groupWrapper.type = "selector";
                break;
            case ProxyGroupType.DIRECT:
                groupWrapper.type = "selector";
                groupWrapper.outbounds = ["direct"];
                break;
            case ProxyGroupType.BLOCK:
                groupWrapper.type = "selector";
                groupWrapper.outbounds = ["block", "direct"];
                break;
        }

        if (group.rules) {
            const copyRules: {type: string; keyword: string}[] = [];
            group.rules.map(r => ({...r, type: SingboxConverter.#ruleTypeKeyMap[r.type] || r.type}))
                .forEach(r => copyRules.push(r));
            groupWrapper.rules = copyRules;
        }
        return groupWrapper;
    }

    private fillTemplate(aggreProxy: AggregatedResource): string {
        const {name} = aggreProxy.groups.filter(e => e.final)[0];
        const singboxConfigInstance = new SingboxConfigurationCore(name);

        aggreProxy.proxies.forEach((val, key) => singboxConfigInstance.addProxy(key, val as unknown as Record<string, unknown>));
        aggreProxy.groups.map(g => this.groupWrapperProvider(g)).forEach(e => singboxConfigInstance.addGroup(e));

        const configObject = singboxConfigInstance.getConfig();
        return JSON.stringify(this.convert2UnderLineObj(configObject), null, 4);
    }
}
