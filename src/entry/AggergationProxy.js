const { defaultGroups, ProxyGroup, ProxyRule } = require('./Grouper')

class AggregationProxy {
    constructor({customGroups}) {
        this.proxies = new Map();
        this.groups = [...defaultGroups];
        if (customGroups) {
            for (const {groupName, type, proxys, rules} of customGroups) {
                let wrapperRules = null;
                if (rules) {
                    wrapperRules = new Array();
                    for (const {ruleType, keyword} of rules) {
                        wrapperRules.push(new ProxyRule(ruleType, keyword));
                    }
                }
                this.groups.push(new ProxyGroup(groupName, type, new RegExp(proxys), wrapperRules));
            }
        }
    }

    addProxy(proxy) {
        if (this.proxies.has(proxy.name)) {
            return;
        }

        this.proxies.set(proxy.name, proxy);
        this.groups.forEach((group) => {
            group.addProxy(proxy);
        });
    }

    refresh() {
        this.proxies.clear();
        this.groups.forEach((group) => {
            group.clear();
        });
    }

    isEmpty() {
        return this.proxies.size == 0;
    }
}

module.exports = AggregationProxy;