const axios = require('axios');
const yaml = require('yaml');
const config = require('../config.json')
const { defaultGroups, ProxyGroup, ProxyRule } = require('./common/Grouper')

const express = require('express');

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

class AppCore {
    
    constructor(addOnConfig, port = 8080) {
        this.configPath = "https://ninjasub.com/link/mXp6ZDSijcNCAHoc?clash=1";
        this.aggProxy = new AggregationProxy(addOnConfig);
        this.addOnConfig = addOnConfig;

        this.app = null;
        this.port = port;
    }

    #isLoaded() {
        return !this.aggProxy.isEmpty();
    }

    #postProcessProxyList(pulledProxies) {
        if (!this.addOnConfig) {
            return;
        }
        
        let {proxys, include, exclude} = this.addOnConfig;
        let filterLogic = ({name}) => {
            if (include) {
                return new RegExp(include).test(name);
            }
            return !(new RegExp(exclude).test(name));
        }

        let processedProxies = pulledProxies.filter(e => filterLogic(e));
        processedProxies.push(...proxys);

        return processedProxies;
    }

    async #loadConfigFromPath() {
        let path = this.configPath;
        let afterProxy = await axios.get(path).then((res) => {
            let document = yaml.parse(res.data);
            return this.#extraClashConfig(document);
        }).then((proxys) => {
            return this.#postProcessProxyList(proxys);
        });

        for (const proxy of afterProxy) {
            this.aggProxy.addProxy(proxy);
        }
    }

    #extraClashConfig(document) {
        let proxys = document?.proxies;
        if (!proxys || proxys.length == 0) {
            throw new Error('load config failed, no proxies found');
        }
        return proxys;
    }

    async getProxies(refresh = false) {
        if (this.#isLoaded() && !refresh) {
            return this.aggProxy;
        }

        this.aggProxy.refresh();
        await this.#loadConfigFromPath();
        return this.aggProxy;
    }

    async run() {
        if (!this.app) {
            this.app = express();
        }

        await this.getProxies();
        const server = this.app.listen(this.port, () => {
            let {address, port} = server.address();
            console.log(`service started, domain: http://${address}:${port}`);
        });
        return this.app;
    }
}

const app = new AppCore(config);
module.exports = app;