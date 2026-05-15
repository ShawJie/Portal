import app from "../App";
import BaseConverter from "./BaseConverter";
import { ProxyGroupType } from "../types/group";
import type { AggregatedResource } from "../types/group";
import type { ClashProxy } from "../types/proxy";
import type { ProxyGroup, ProxyRule } from "../entry/Grouper";
import type { ConvertContext } from "../types/context";
import type { AccessUser } from "../types/context";
import SurfboardConfigurationCore from "./surfboard/SurfboardConfigurationCore";

interface SurfboardGroupWrapper {
    name: string;
    type: string;
    endpoints: string[];
    rules?: ProxyRule[];
}

export default class SurfboardConverter extends BaseConverter {

    constructor() {
        super('surfboard.conf');
    }

    async export({accessUser}: ConvertContext): Promise<string> {
        const aggProxy = await app.getProxies();
        return this.fillTemplate(aggProxy, accessUser);
    }

    private processGroup(groups: string[], proxies: ClashProxy[]): string[] {
        const endpoints: string[] = [];
        if (groups && groups.length > 0) {
            endpoints.push(...groups);
        }
        if (proxies && proxies.length > 0) {
            endpoints.push(...proxies.map(p => p.name));
        }
        return endpoints;
    }

    private generateAutoRefreshComment(userinfo?: AccessUser): string {
        return `#!MANAGED-CONFIG ${app.getDomainHostWithAuth(userinfo)}/surfboard interval=64800 strict=false`;
    }

    private groupWrapperProvider(group: ProxyGroup): SurfboardGroupWrapper {
        const groupWrapper: SurfboardGroupWrapper = {
            name: group.name,
            endpoints: [...this.processGroup(group.groups, group.proxies)],
            type: ''
        };

        switch(group.type) {
            case ProxyGroupType.URL_TEST:
                groupWrapper.type = "url-test";
                break;
            case ProxyGroupType.SELECT:
                groupWrapper.type = "select";
                break;
            case ProxyGroupType.DIRECT:
                groupWrapper.type = "select";
                groupWrapper.endpoints = ["DIRECT"];
                break;
            case ProxyGroupType.BLOCK:
                groupWrapper.type = "select";
                groupWrapper.endpoints = ["REJECT", "DIRECT"];
                break;
        }

        if (group.rules && group.rules.length > 0) {
            const copyRules: ProxyRule[] = [];
            group.rules.map(r => ({...r}))
                .forEach(r => copyRules.push(r));
            groupWrapper.rules = copyRules;
        }
        return groupWrapper;
    }

    private fillTemplate(aggreProxy: AggregatedResource, userinfo?: AccessUser): string {
        const {name} = aggreProxy.groups.filter(e => e.final)[0];
        const surfboardConfigurationCore = new SurfboardConfigurationCore(name, this.generateAutoRefreshComment(userinfo));

        aggreProxy.proxies.forEach((val, key) => surfboardConfigurationCore.addProxy(key, val));
        aggreProxy.groups.map(g => this.groupWrapperProvider(g)).forEach(e => surfboardConfigurationCore.addGroup(e));

        return surfboardConfigurationCore.getConfig();
    }
}
