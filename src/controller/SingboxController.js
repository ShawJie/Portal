const {app} = require("../App");
const BaseController = require("./BaseController");

class SingboxController extends BaseController {
    
    constructor() {
        super('singbox.json');
    }

    async export() {
        let aggProxy = await app.getProxies();
        return sinboxConfiger.fillTemplate(aggProxy);
    }
}

const sinboxConfiger = (function() {
    const singboxConfigTemplate = {
        dns: {
            rules: [
                {outbound: ["any"], server: "local"}, 
                {disable_cache: true, geosite: ["category-ads-all"], server: "block"}, 
                {clash_mode: "global", server: "remote"}, 
                {clash_mode: "direct", server: "local"}, 
                {geosite: "cn", server: "local"}, 
            ],
            servers: [
                {address: "https://1.12.12.12/dns-query", tag: "remote"},
                {address: "local", detour: "direct", tag: "local"},
                {address: "rcode://success", tag: "block"},
            ],
            strategy: "prefer_ipv4"
        },
        experimental: {
            clash_api: {
                external_controller: "127.0.0.1:9090",
                secret: "",
                store_selected: true
            }
        },
        inbounds: [
            {"auto_route":true,"domain_strategy":"prefer_ipv4","endpoint_independent_nat":true,"inet4_address":"172.19.0.1/30","inet6_address":"2001:0470:f9da:fdfa::1/64","mtu":9000,"sniff":true,"sniff_override_destination":true,"stack":"mixed","strict_route":true,"type":"tun"},
            {"domain_strategy":"prefer_ipv4","listen":"127.0.0.1","listen_port":2333,"sniff":true,"sniff_override_destination":true,"tag":"socks-in","type":"socks","users":[]},
            {"domain_strategy":"prefer_ipv4","listen":"127.0.0.1","listen_port":2334,"sniff":true,"sniff_override_destination":true,"tag":"mixed-in","type":"mixed","users":[]}
        ],
        log: {
            level: "info"
        },
        outbounds: [
            {"tag":"dns-out","type":"dns"},
            {"tag":"direct","type":"direct"}, 
            {"tag":"block","type":"block"},
        ],
        route: {
            final: "节点选择",
            auto_detect_interface: true,
            rules: [
                {"geosite":"category-ads-all","outbound":"block"}, 
                {"outbound":"dns-out","protocol":"dns"}, 
                {"clash_mode":"direct","outbound":"direct"}, 
                {"clash_mode":"global","outbound":"节点选择"}, 
                {"ip_cidr": ["192.168.0.0/16", "10.0.0.0/8", "172.16.0.0/12", "100.64.0.0/10", "17.0.0.0/8"], "outbound": "direct"},
                {"geoip":["cn","private"],"outbound":"direct"}, 
                {"geosite":"cn","outbound":"direct"},
            ]
        }
    };

    const ruleTypeKeyMap = {
        "DOMAIN": "domain",
        "DOMAIN-SUFFIX": "domain_suffix",
        "DOMAIN-KEYWORD": "domain_keyword",
    }

    function clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function processGroup(groups, proxies) {
        let outbounds = new Array();
        if (groups && groups.length > 0) {
            outbounds.push(...groups);
        }
        if (proxies && proxies.length > 0) {
            outbounds.push(...proxies.map(p => p.name));
        }
        return outbounds;
    }

    function fillTemplateProxies(template, proxies) {
        for (const [key, proxy] of proxies) {
            let proxyContent = null, 
                {server, port, password} = proxy;
            switch (proxy.type) {
                case 'ss':
                    let {cipher, plugin} = proxy;
                    let pluginOpts = proxy['plugin-opts'];
                    proxyContent = {
                        password, server, server_port: port, tag: key, type: "shadowsocks", method: cipher
                    };

                    if (plugin) {
                        switch (plugin) {
                            case 'obfs':
                                proxyContent.plugin = 'obfs-local';
                                proxyContent.plugin_opts = `obfs=${pluginOpts.mode};obfs-host=${pluginOpts.host}`;
                                break;
                        }
                    }
                    break;
                case 'http':
                    let {username, tls, skipCertVerify} = proxy;
                    proxyContent = {password, server, server_port: port, tag: key, type: 'http', username};
                    if (tls) {
                        proxyContent.tls = {
                            enabled: true,
                            insecure: skipCertVerify ?? false
                        };
                    }
                    break;
            }
            template.outbounds.push(proxyContent);
        }
    }

    function fillTemplateGroups(template, groups) {
        for (const group of groups) {
            let {name, type} = group, groupContent = null;
            switch (type) {
                case 'url-test':
                    groupContent = {
                        tag: name,
                        type: 'urltest',
                        outbounds: [...processGroup(group.groups, group.proxies)]
                    };
                    break;
                case 'select':
                    groupContent = {
                        tag: name,
                        type: 'selector',
                        outbounds: [...processGroup(group.groups, group.proxies)]
                    };
                    break;
            }

            if (group.rules && group.rules.length > 0) {
                let subRule = {outbound: name};
                for (const rule of group.rules) {
                    let target = ruleTypeKeyMap[rule.type];
                    if (!subRule[target]) {
                        subRule[target] = new Array();
                    }
                    subRule[target].push(rule.keyword);
                }
                template.route.rules.push(subRule);
            }

            template.outbounds.push(groupContent);
        }
    }

    function fillTemplate(aggreProxy) {
        let surfboardConfig = clone(singboxConfigTemplate);

        fillTemplateProxies(surfboardConfig, aggreProxy.proxies);
        fillTemplateGroups(surfboardConfig, aggreProxy.groups);
        
        return JSON.stringify(surfboardConfig, null, 4);
    }

    return {
        fillTemplate
    }
})();

module.exports = SingboxController;