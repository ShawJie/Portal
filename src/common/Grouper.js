class ProxyGroup {
    constructor(name, type, filter) {
        this.name = name;
        this.type = type;
        this.filter = filter;
        this.proxies = new Array();
        this.groups = new Array();
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
    new ProxyGroup("节点选择", "select")
        .addGroup('香港节点').addGroup('日本节点')
        .addGroup('美国节点').addGroup('台湾节点')
        .addGroup('新加坡节点').addGroup("手动切换"),
    new ProxyGroup("手动切换", "select", new RegExp(".*")),
    new ProxyGroup("香港节点", "url-test", new RegExp("港")),
    new ProxyGroup("日本节点", "url-test", new RegExp("日")),
    new ProxyGroup("美国节点", "url-test", new RegExp("美")),
    new ProxyGroup("台湾节点", "url-test", new RegExp("台")),
    new ProxyGroup("新加坡节点", "url-test", new RegExp("(新|狮城)")),
]

module.exports = {
    ProxyGroup,
    defaultGroups
}