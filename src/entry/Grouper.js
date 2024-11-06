const proxyGroupType = {
    URL_TEST: "url-test",
    SELECT: "select",
    DIRECT: "direct",
    BLOCK: "block",
}

const proxyRuleType = {
    DOMAIN: "DOMAIN",
    DOMAIN_SUFFIX: "DOMAIN-SUFFIX",
    DOMAIN_KEYWORD: "DOMAIN-KEYWORD",
    IP_CIDR: "IP-CIDR",
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
        this.final = false;
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

    setAsFinal() {
        this.final = true;
        return this;
    }

    clear() {
        this.proxies = new Array();
    }

    clone() {
        let cloneObj = new ProxyGroup(this.name, this.type, this.filter, this.rules);
        cloneObj.proxies = this.proxies.slice();
        cloneObj.groups = this.groups.slice();
        cloneObj.final = this.final;
        return cloneObj;
    }

    isBlankGroup() {
        if (this.final || this.type === proxyGroupType.DIRECT || this.type === proxyGroupType.BLOCK) {
            return false;
        }
        return this.proxies.length === 0 && this.groups.length === 0;
    }
}

const DIRECT_GROUP = "直连";
const BLOCK_GROUP = "拦截";

const defaultGroups = [
    new ProxyGroup("节点选择", proxyGroupType.SELECT)
        .addGroup("自动选择").addGroup('香港节点')
        .addGroup('日本节点').addGroup('美国节点')
        .addGroup('台湾节点').addGroup('新加坡节点')
        .addGroup('韩国节点').addGroup('英国节点')
        .addGroup('德国节点').addGroup("手动切换")
        .addGroup(DIRECT_GROUP)
        .setAsFinal(),
    new ProxyGroup("手动切换", proxyGroupType.SELECT, new RegExp(".*")),
    new ProxyGroup("自动选择", proxyGroupType.URL_TEST, new RegExp(".*")),
    new ProxyGroup("香港节点", proxyGroupType.URL_TEST, new RegExp("(港|Hong Kong|HK)")),
    new ProxyGroup("日本节点", proxyGroupType.URL_TEST, new RegExp("(日|Japan|JP)")),
    new ProxyGroup("美国节点", proxyGroupType.URL_TEST, new RegExp("(美|USA)")),
    new ProxyGroup("台湾节点", proxyGroupType.URL_TEST, new RegExp("(台|Taiwan)")),
    new ProxyGroup("韩国节点", proxyGroupType.URL_TEST, new RegExp("(韩|Korea|KR)")),
    new ProxyGroup("英国节点", proxyGroupType.URL_TEST, new RegExp("(英|Breatin|UK)")),
    new ProxyGroup("德国节点", proxyGroupType.URL_TEST, new RegExp("(德|Germany|DE)")),
    new ProxyGroup("新加坡节点", proxyGroupType.URL_TEST, new RegExp("(新|Singapore)")),
    new ProxyGroup(DIRECT_GROUP, proxyGroupType.DIRECT),
    new ProxyGroup(BLOCK_GROUP, proxyGroupType.BLOCK)
]

module.exports = {
    ProxyGroup,
    ProxyRule,
    proxyRuleType,
    proxyGroupType,
    defaultGroups
}