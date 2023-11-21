const yaml = require('yaml');
const BaseController = require("./BaseController");
const { app } = require("../App");

class ClashController extends BaseController {

    static #autoRouter = {
        url: 'http://www.gstatic.com/generate_204',
        interval: 300,
    };

    static #clashConfigTemplate = {
        port: 7890,
        socksPort: 7891,
        redirPort: 7892,
        allowLan: false,
        mode: 'rule',
        logLevel: 'silent',
        externalController: '0.0.0.0:9090',
        secret: '',
        proxies: [],
        proxyGroups: [],
        rules: [
            "GEOIP,CN,DIRECT",
            "MATCH,节点选择"
        ]
    }

    constructor() {
        super('clash-config.yaml');
    }

    async export() {
        let aggProxy = await app.getProxies();
        return this.#fillTemplate(aggProxy);
    }

    #convert2KebabizeObj(target) {
        if (typeof target !== 'object') {
            return target;
        }

        let tmpObj = new Object();
        for (const key in target) {
            let nKey = super._kebabize(key), val = target[key];
            if (typeof val === 'object') {
                if (Array.isArray(val)) {
                    let objArray = new Array();
                    for (const item of val) {
                        objArray.push(this.#convert2KebabizeObj(item));
                    }
                    tmpObj[nKey] = objArray;
                } else {
                    tmpObj[nKey] = this.#convert2KebabizeObj(val);
                }
            } else {
                tmpObj[nKey] = val;
            }
        }
        return tmpObj;
    }

    #fillTemplateProxies(template, proxies) {
        for (const [key, proxy] of proxies) {
            template.proxies.push(proxy);
        }
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

    #fillTemplateGroups(template, groups) {
        for (const group of groups) {
            let groupContent = {
                name: group.name,
                type: group.type,
                proxies: this.#processGroup(group.groups, group.proxies)
            };

            if (group.type === 'url-test') {
                groupContent.url = ClashController.#autoRouter.url;
                groupContent.interval = ClashController.#autoRouter.interval;
            }

            template.proxyGroups.push(groupContent);

            if (group.rules && group.rules.length > 0) {
                group.rules.map(r => `${r.type},${r.keyword},${group.name}`)
                    .forEach(r => template.rules.unshift(r));
            }
        }
    }

    #fillTemplate(aggreProxy) {
        let clashConfig = super._clone(ClashController.#clashConfigTemplate);

        this.#fillTemplateProxies(clashConfig, aggreProxy.proxies);
        this.#fillTemplateGroups(clashConfig, aggreProxy.groups);
        

        return yaml.stringify(this.#convert2KebabizeObj(clashConfig), {
            defaultKeyType: 'PLAIN',
            defaultStringType: 'QUOTE_DOUBLE'
        });
    }
}

module.exports = new ClashController();