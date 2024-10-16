const { defaultGroups, ProxyGroup, ProxyRule, proxyGroupType } = require('./Grouper')

class AggregationProxy {
    constructor({customGroups}) {
        this.proxies = new Map();
        this.groups = [...defaultGroups];
        if (customGroups) {
            for (const {groupName, type, proxys, rules, attachGroup} of customGroups) {
                let wrapperRules = null;
                if (rules) {
                    wrapperRules = new Array();
                    for (const {ruleType, keyword} of rules) {
                        wrapperRules.push(new ProxyRule(ruleType, keyword));
                    }
                }

                let curGroupInst = new ProxyGroup(
                    groupName, type, proxys ? new RegExp(proxys) : undefined, wrapperRules);
                if (attachGroup) {
                    attachGroup.forEach((group) => {
                        curGroupInst.addGroup(group);
                    });
                }

                this.groups.push(curGroupInst);
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

    #filterEmptyGroup(groupInst) {
        if (groupInst.final) {
            return true;
        }

        if (groupInst.type === proxyGroupType.DIRECT || groupInst.type === proxyGroupType.BLOCK) {
            return true;
        }

        return groupInst.proxies.length > 0 || groupInst.groups.length > 0;
    }

    resource() {
        return {
            proxies: this.proxies,
            groups: this.groups.filter(g => this.#filterEmptyGroup(g))
        }
    }

    isEmpty() {
        return this.proxies.size == 0;
    }
}

module.exports = AggregationProxy;