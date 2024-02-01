const app = require("../App");
const BaseConverter = require("./BaseConverter");
const { proxyGroupType } = require("../entry/Grouper");
const SurfboardConfigurationCore = require("./surfboard/SurfboardConfigurationCore");

class SurfboardConverter extends BaseConverter {

    constructor() {
        super('surfboard.conf');
    }

    async export({accessUser}) {
        let aggProxy = await app.getProxies();
        return this.#fillTemplate(aggProxy, accessUser);
    }

    #processGroup(groups, proxies) {
        let endpoints = new Array();
        if (groups && groups.length > 0) {
            endpoints.push(...groups);
        }
        if (proxies && proxies.length > 0) {
            endpoints.push(...proxies.map(p => p.name));
        }
        return endpoints;
    }

    #generateAutoRefreshComment(userinfo) {
        return `#!MANAGED-CONFIG ${app.getDomainHostWithAuth(userinfo)}/surfboard interval=64800 strict=false`;
    }

    #groupWrapperProvider(group) {
        let groupWrapper = {
            name: group.name,
            endpoints: [...this.#processGroup(group.groups, group.proxies)],
        };

        switch(group.type) {
            case proxyGroupType.URL_TEST:
                groupWrapper.type = "url-test";
                break;
            case proxyGroupType.SELECT:
                groupWrapper.type = "select";
                break;
            case proxyGroupType.DIRECT:
                groupWrapper.type = "select";
                groupWrapper.endpoints = ["DIRECT"];
                break;
            case proxyGroupType.BLOCK:
                groupWrapper.type = "select";
                groupWrapper.endpoints = ["REJECT", "DIRECT"]
                break;
        }

        if (group.rules && group.rules.length > 0) {
            let copyRules = new Array();
            group.rules.map(r => {return {...r}})
                .forEach(r => copyRules.push(r));
            groupWrapper.rules = copyRules;
        }
        return groupWrapper;
    }

    #fillTemplate(aggreProxy, userinfo) {
        const {name} = aggreProxy.groups.filter(e => e.final)[0];
        const surfboardConfigurationCore = new SurfboardConfigurationCore(name, this.#generateAutoRefreshComment(userinfo));

        aggreProxy.proxies.forEach((val, key) => surfboardConfigurationCore.addProxy(key, val));
        aggreProxy.groups.map(g => this.#groupWrapperProvider(g)).forEach(e => surfboardConfigurationCore.addGroup(e));

        return surfboardConfigurationCore.getConfig();
    }
}

module.exports = new SurfboardConverter();