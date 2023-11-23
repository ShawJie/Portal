const axios = require('axios');
const yaml = require('yaml');
const nodeCron = require('node-cron');
const logger = require('./Logger');
const config = require('../config.json');

const express = require('express');

const AggregationProxy = require('./entry/AggergationProxy');
const PortalConfigurationProperty = require('./config/PortalConfigurationProperty');

class AppCore {
    
    constructor(addOnConfig, port = 8080) {
        let property = new PortalConfigurationProperty(addOnConfig);
        let aggProxy = new AggregationProxy(property);

        this.property = property;
        this.aggProxy = aggProxy;

        this.port = port;
        this.server = null;
    }

    getDomainHost() {
        return this.property.host;
    }

    accessControl() {
        return this.property.accessSet.size > 0;
    }

    inAccessSet(decrypt) {
        return this.property.accessSet.has(decrypt);
    }

    #isLoaded() {
        return !this.aggProxy.isEmpty();
    }

    #postProcessProxyList(pulledProxies) {
        let {proxys, include, exclude} = this.property;
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
        let path = this.property.basePath;
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
            logger.info(`service started, domain: http://${address}:${port}`);
        });

        nodeCron.schedule(this.property.refreshCron, async () => {
            logger.info('refreshing proxy list...');
            await this.getProxies(true);
            logger.info('refreshing proxy list finished');
        });
        return this.server;
    }
}

const app = new AppCore(config);
module.exports = app;