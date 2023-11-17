const app = require("../App");
const ini = require("ini");

const surfboardController = async (req, res) => {
    let aggProxy = await app.getProxies();
    res.writeHead(200, {'Content-Type': 'application/force-download','Content-disposition':'attachment; filename=surfboard.conf'});
    res.end(surfboardConfiger.fillTemplate(aggProxy));
};

const surfboardConfiger = (function() {
    const surfboardConfigTemplate = {
        "General": {
            "dns-server": "system, 8.8.8.8, 8.8.4.4, 9.9.9.9:9953",
            "skip-proxy": "127.0.0.1, 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12, 100.64.0.0/10, 17.0.0.0/8, localhost, *.local, *.crashlytics.com",
            "proxy-test-url": "http://www.gstatic.com/generate_204",
            "always-real-ip": "*.srv.nintendo.net, *.stun.playstation.net, xbox.*.microsoft.com, *.xboxlive.com"
        },
        "Proxy": {},
        "Proxy Group": {},
        "Rule": [
            "GEOIP,CN,DIRECT",
            "FINAL,节点选择"
        ]
    };

    function clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function processGroup(groups, proxies) {
        let content = '';
        if (groups && groups.length > 0) {
            content += groups.join(', ');
        }
        if (proxies && proxies.length > 0) {
            content += proxies.map(p => p.name).join(', ');
        }
        return content;
    }

    function fillTemplate(aggreProxy) {
        let surfboardConfig = clone(surfboardConfigTemplate);
        let proxies = aggreProxy.proxies;
        let proxyGroup = aggreProxy.groups;

        for (const [key, proxy] of proxies) {
            let proxyContent = null, name = proxy.name;
            switch (proxy.type) {
                case 'ss':
                    {
                        let {server, port, cipher, password, udp} = proxy;
                        let pluginOpts = proxy['plugin-opts'];
                        proxyContent = `ss, ${server}, ${port}, encrypt-method=${cipher}, password=${password}, udp-relay=${udp}, obfs=http, obfs-host=${pluginOpts.host}`;
                    }
                    break;
                case 'http':
                    {
                        let {server, port, username, password, tls, skipCertVerify} = proxy;
                        proxyContent = `https, ${server}, ${port}, ${username}, ${password}`;
                        if (tls) {
                            proxyContent += `, ${skipCertVerify}`;
                        }
                    }
                    break;
            }
            surfboardConfig.Proxy[name] = ini.unsafe(proxyContent);
        }

        for (const group of proxyGroup) {
            let {name, type} = group, groupContent = null;
            switch (type) {
                case 'url-test':
                    groupContent = `url-test, ${processGroup(group.groups, group.proxies)}, interval = 300`;
                    break;
                case 'select':
                    groupContent = `select, ${processGroup(group.groups, group.proxies)}, DIRECT`;
                    break;
            }
            surfboardConfig['Proxy Group'][name] = ini.unsafe(groupContent);
        }

        let configContent = '';
        for (const key in surfboardConfig) {
            let section = surfboardConfig[key];
            configContent += `[${key}]\n`;
            if (Array.isArray(section)) {
                configContent += section.join('\n');
            } else {
                for (const key in section) {
                    let value = section[key];
                    configContent += `${key} = ${value}\n`;
                }
            }
            configContent += '\n';
        }
        return configContent;
    }

    return {
        fillTemplate
    }
})();

module.exports = surfboardController;