const proxyGroupType = {
    URL_TEST: "url-test",
    SELECT: "select"
}

const proxyRuleType = {
    DOMAIN: "DOMAIN",
    DOMAIN_SUFFIX: "DOMAIN-SUFFIX",
    DOMAIN_KEYWORD: "DOMAIN-KEYWORD",
}

class ProxyRule {

    /**
     * @param {proxyRuleType} type 
     * @param {String} keyword 
     */
    constructor(type, keyword) {
        this.type = type;
        this.keyword = keyword;
    }
}

class ProxyGroup {
    
    /**
     * 
     * @param {String} name 
     * @param {proxyGroupType} type 
     * @param {Object} filter 
     * @param {Array} rules 
     */
    constructor(name, type, filter, rules) {
        this.name = name;
        this.type = type;
        this.filter = filter;
        this.proxies = new Array();
        this.groups = new Array();
        this.rules = rules;
    }

    addProxy(proxy) {
        switch(typeof this.filter) {
            case 'function':
                if (this.filter(proxy)) {
                    this.proxies.push(proxy);
                }
                break;
            case 'object':
                if (this.filter.test(proxy.name)) {
                    this.proxies.push(proxy);
                }
                break;

        }
    }

    addGroup(groupName) {
        this.groups.push(groupName);
        return this;
    }

    clear() {
        this.proxies = new Array();
    }
}

const defaultGroups = [
    new ProxyGroup("节点选择", proxyGroupType.SELECT)
        .addGroup("自动选择").addGroup('香港节点')
        .addGroup('日本节点').addGroup('美国节点')
        .addGroup('台湾节点').addGroup('新加坡节点')
        .addGroup("手动切换"),
    new ProxyGroup("手动切换", proxyGroupType.SELECT, new RegExp(".*")),
    new ProxyGroup("自动选择", proxyGroupType.URL_TEST, new RegExp(".*")),
    new ProxyGroup("香港节点", proxyGroupType.URL_TEST, new RegExp("港")),
    new ProxyGroup("日本节点", proxyGroupType.URL_TEST, new RegExp("日")),
    new ProxyGroup("美国节点", proxyGroupType.URL_TEST, new RegExp("美")),
    new ProxyGroup("台湾节点", proxyGroupType.URL_TEST, new RegExp("台")),
    new ProxyGroup("新加坡节点", proxyGroupType.URL_TEST, new RegExp("(新|韩国)")),
]

module.exports = {
    ProxyGroup,
    ProxyRule,
    proxyRuleType,
    defaultGroups
}