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

function countriesNodeGroup() {
    const regionNamesInChinese = new Intl.DisplayNames('zh-CN', { type: "region" }),
          regionNAmesInEnglish = new Intl.DisplayNames('en', { type: "region" }),
          countryCodes = [['HK', '香港', 'Hong Kong'], 'UK', 'DE', 'US', 'KR', 'JP', 'TW', 'SG'];

    return countryCodes.map(c => {
        if (Array.isArray(c)) {
            let [code, name, fullName] = c;
            return [name, fullName, code];
        }
        return [regionNamesInChinese.of(c), regionNAmesInEnglish.of(c), c];
    })
    .map(([regionNameChinese, regionName, counrtyCode]) => 
        new ProxyGroup(
            `${regionNameChinese}节点`, proxyGroupType.URL_TEST, 
            new RegExp(`(${regionNameChinese}|${regionName}|${counrtyCode})`)
        )
    );
}

const countriesNode = countriesNodeGroup();
const manualSelectGroup = new ProxyGroup("节点选择", proxyGroupType.SELECT)
    .addGroup("自动选择").addGroup("手动切换").addGroup(DIRECT_GROUP).setAsFinal();

countriesNode.forEach(g => manualSelectGroup.addGroup(g.name));

const defaultGroups = [
    manualSelectGroup,
    new ProxyGroup("手动切换", proxyGroupType.SELECT, new RegExp(".*")),
    new ProxyGroup("自动选择", proxyGroupType.URL_TEST, new RegExp(".*")),
    ...countriesNode,
    new ProxyGroup(DIRECT_GROUP, proxyGroupType.DIRECT),
    new ProxyGroup(BLOCK_GROUP, proxyGroupType.BLOCK)
]

export {
    ProxyGroup,
    ProxyRule,
    proxyGroupType,
    defaultGroups
}