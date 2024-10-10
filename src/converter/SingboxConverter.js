const app = require("../App");
const BaseConverter = require("./BaseConverter");
const { proxyGroupType } = require("../entry/Grouper");
const SingboxConfigurationCore = require("./singbox/SingboxConfigurationCore");

class SingboxConverter extends BaseConverter {

    static #ruleTypeKeyMap = {
        "DOMAIN": "domain",
        "DOMAIN-SUFFIX": "domainSuffix",
        "DOMAIN-KEYWORD": "domainKeyword",
        "IP-CIDR": "ip_cidr",
    }

    static #versionTakePattern = new RegExp("SFI/(?<version>[0-9\\.]+)");

    constructor() {
        super('singbox.json');
    }

    async export({ua}) {
        let matcher = ua.match(SingboxConverter.#versionTakePattern);
        if (matcher) {
            let {version} = matcher.groups;
            if (!this.#versionThreshold(version)) {
                return `sing-box version (${version}) is to old, not support anymore`;
            }
        }
        let aggProxy = await app.getProxies();
        return this.#fillTemplate(aggProxy);
    }

    #versionThreshold(version) {
        const lessVersion = [1, 8];
        
        let versionSplited = version.split('.').map(e => parseInt(e));
        while (lessVersion.length > 0) {
            let cur = lessVersion.shift();
            let curVersion = versionSplited.shift();
            if (curVersion < cur) {
                return false;
            }
        }
        return true;
    }

    #processGroup(groups, proxies) {
        let outbounds = new Array();
        if (groups && groups.length > 0) {
            outbounds.push(...groups);
        }
        if (proxies && proxies.length > 0) {
            outbounds.push(...proxies.map(p => p.name));
        }
        return outbounds;
    }

    #convert2UnderLineObj(target) {
        if (typeof target !== 'object') {
            return target;
        }

        let tmpObj = new Object();
        for (const key in target) {
            let nKey = super._underlinize(key), val = target[key];
            if (typeof val === 'object') {
                if (Array.isArray(val)) {
                    let objArray = new Array();
                    for (const item of val) {
                        objArray.push(this.#convert2UnderLineObj(item));
                    }
                    tmpObj[nKey] = objArray;
                } else {
                    tmpObj[nKey] = this.#convert2UnderLineObj(val);
                }
            } else {
                tmpObj[nKey] = val;
            }
        }
        return tmpObj;
    }

    #groupWrapperProvider(group) {
        let groupWrapper = {
            name: group.name,
            outbounds: [...this.#processGroup(group.groups, group.proxies)],
        };

        switch(group.type) {
            case proxyGroupType.URL_TEST:
                groupWrapper.type = "urltest";
                break;
            case proxyGroupType.SELECT:
                groupWrapper.type = "selector";
                break;
            case proxyGroupType.DIRECT:
                groupWrapper.type = "selector";
                groupWrapper.outbounds = ["direct"];
                break;
            case proxyGroupType.BLOCK:
                groupWrapper.type = "selector";
                groupWrapper.outbounds = ["block", "direct"]
                break;
        }

        if (group.rules) {
            let copyRules = new Array();
            group.rules.map(r => {return {...r, type: SingboxConverter.#ruleTypeKeyMap[r.type]}})
                .forEach(r => copyRules.push(r));
            groupWrapper.rules = copyRules;
        }
        return groupWrapper;
    }

    #fillTemplate(aggreProxy) {
        const {name} = aggreProxy.groups.filter(e => e.final)[0];
        const singboxConfigInstance = new SingboxConfigurationCore(name);

        aggreProxy.proxies.forEach((val, key) => singboxConfigInstance.addProxy(key, val));
        aggreProxy.groups.map(g => this.#groupWrapperProvider(g)).forEach(e => singboxConfigInstance.addGroup(e));

        let configObject = singboxConfigInstance.getConfig();
        return JSON.stringify(this.#convert2UnderLineObj(configObject), null, 4);
    }
}

module.exports = new SingboxConverter();