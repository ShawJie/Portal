const app = require("../App");
const BaseConverter = require("./BaseConverter");

const sectionKeyMap = {
    general: 'General',
    proxy: 'Proxy',
    proxyGroup: 'Proxy Group',
    rule: 'Rule'
};

class SurfboardConfigSection {

    constructor (name) {
        this.name = name;
        this.properties = new Array();
    }

    addProperty(key, value) {
        this.properties.push({key, value});
    }

    addDirectVal(val) {
        this.properties.unshift(val);
    }
}

class SufrboardConfig {

    constructor(sections) {
        this.sectionMap = new Map();
        sections.forEach(e => this.sectionMap.set(e.name, e));

        this.sections = sections;
        this.comment = null;
    }

    /**
     * 
     * @param {sectionMap} name 
     * @returns 
     */
    getSection(name) {
        return this.sectionMap.get(name);
    }

    addComment(comment) {
        this.comment = comment;
    }

    generate() {
        let configContent = '';
        if (this.comment) {
            configContent += this.comment + '\n\n';
        }

        for (const section of this.sections) {
            configContent += `[${section.name}]\n`;
            for (const property of section.properties) {
                if (typeof property === 'string') {
                    configContent += `${property}\n`;
                } else {
                    configContent += `${property.key} = ${property.value}\n`;
                }
            }
            configContent += '\n';
        }
        return configContent;
    }
}

class SurfboardConfigFactory {

    static #addGeneralSection() {
        let section = new SurfboardConfigSection(sectionKeyMap.general);
        section.addProperty('dns-server', 'system, 8.8.8.8, 8.8.4.4, 9.9.9.9:9953');
        section.addProperty('skip-proxy', '127.0.0.1, 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12, 100.64.0.0/10, 17.0.0.0/8, localhost, *.local, *.crashlytics.com');
        section.addProperty('proxy-test-url', 'http://www.gstatic.com/generate_204');
        section.addProperty('always-real-ip', '*.srv.nintendo.net, *.stun.playstation.net, xbox.*.microsoft.com, *.xboxlive.com');
        return section;
    }

    static #addProxySection() {
        return new SurfboardConfigSection(sectionKeyMap.proxy);
    }

    static #addProxyGroupSection() {
        return new SurfboardConfigSection(sectionKeyMap.proxyGroup);
    }

    static #addRuleSection() {
        let ruleSection = new SurfboardConfigSection(sectionKeyMap.rule);
        ruleSection.addDirectVal("FINAL,节点选择");
        ruleSection.addDirectVal("GEOIP,CN,DIRECT");
        return ruleSection;
    }

    static newConfigLayer() {
        let sections = new Array();
        sections.push(this.#addGeneralSection());
        sections.push(this.#addProxySection());
        sections.push(this.#addProxyGroupSection());
        sections.push(this.#addRuleSection());

        return new SufrboardConfig(sections);
    }
}

class SurfboardConverter extends BaseConverter {

    constructor() {
        super('surfboard.conf');
    }

    async export() {
        let aggProxy = await app.getProxies();
        return this.#fillTemplate(aggProxy);
    }

    #processGroup(groups, proxies) {
        let content = '';
        if (groups && groups.length > 0) {
            content += groups.join(', ');
        }
        if (proxies && proxies.length > 0) {
            content += proxies.map(p => p.name).join(', ');
        }
        return content;
    }

    /**
     * 
     * @param {SufrboardConfig} layer 
     * @param {any} proxies 
     */
    #fillTemplateProxies(layer, proxies) {
        for (const [key, proxy] of proxies) {
            let proxyConfig = null, {server, port, password} = proxy;
            switch (proxy.type) {
                case 'ss':
                    proxyConfig = `ss, ${server}, ${port}, encrypt-method=${proxy.cipher}, ` +
                        `password=${password}, udp-relay=${proxy.udp}, obfs=${proxy['plugin-opts'].mode}, ` + 
                        `obfs-host=${proxy['plugin-opts'].host}`;
                    break;
                case 'http':
                    proxyConfig = `${proxy.tls ? 'https' : 'http'}, ${server}, ${port}, ` + 
                        `${proxy.username}, ${password}`;
                    if (proxy.tls) {
                        proxyConfig += `, skip-cert-verify=${proxy.skipCertVerify ?? false}`;
                    }
                    break;
            }
            layer.getSection(sectionKeyMap.proxy).addProperty(key, proxyConfig);
        }
    }

    #fillTemplateGroups(layer, groups) {
        for (const group of groups) {
            let {name, type} = group, groupContent = null;
            switch (type) {
                case 'url-test':
                    groupContent = `url-test, ${this.#processGroup(group.groups, group.proxies)}, interval = 300`;
                    break;
                case 'select':
                    groupContent = `select, ${this.#processGroup(group.groups, group.proxies)}, DIRECT`;
                    break;
            }

            if (group.rules && group.rules.length > 0) {
                group.rules.map(r => `${r.type},${r.keyword},${name}`)
                    .forEach(r => layer.getSection(sectionKeyMap.rule).addDirectVal(r));
            }

            layer.getSection(sectionKeyMap.proxyGroup).addProperty(name, groupContent);
        }
    }

    #fillTemplate(aggreProxy) {
        let surfboardConfig = SurfboardConfigFactory.newConfigLayer();

        this.#fillTemplateProxies(surfboardConfig, aggreProxy.proxies);
        this.#fillTemplateGroups(surfboardConfig, aggreProxy.groups);
        
        surfboardConfig.addComment(`#!MANAGED-CONFIG ${app.getDomainHost()}/surfboard interval=64800 strict=false`)
        return surfboardConfig.generate();
    }
}

module.exports = new SurfboardConverter();