const axios = require('axios');
const yaml = require('yaml');
const { defaultGroups, ProxyGroup, ProxyRule } = require('./entry/Grouper')
const express = require('express');
const nodeCron = require('node-cron');

const config = require('../config.json');


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
        this.configPath = addOnConfig.basePath;
        this.aggProxy = new AggregationProxy(addOnConfig);
        this.addOnConfig = addOnConfig;

        this.port = port;
        this.refreshCron = addOnConfig.refreshCron ?? '0 15 3 * * *';
        this.server = null;
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
        let afterProxy = null;
        if (path) {
            afterProxy = await axios.get(path).then((res) => {
                let document = yaml.parse(res.data);
                return this.#extraClashConfig(document);
            }).then((proxys) => {
                return this.#postProcessProxyList(proxys);
            });
        } else {
            afterProxy = this.#postProcessProxyList([]);
        }

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
        if (!this.server) {
            this.server = express();
        }

        await this.getProxies();
        const server = this.server.listen(this.port, () => {
            let {address, port} = server.address();
            console.log(`service started, domain: http://${address}:${port}`);
        });

        nodeCron.schedule(this.refreshCron, async () => {
            console.info('refreshing proxy list...');
            await this.getProxies(true);
        });
        return this.server;
    }
}

const app = new AppCore(config);
const domainHost = config.host ?? '';

module.exports = {domainHost, app};