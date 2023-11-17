const axios = require('axios');
const express = require('express');

const yaml = require('yaml');

class AppCore {
    constructor(addOnConfig, port = 8080) {
        this.configPath = "https://ninjasub.com/link/mXp6ZDSijcNCAHoc?clash=1";
        this.addOnConfig = addOnConfig;
        this.app = null;

        this.proxys = new Array();
        this.port = port;
    }

    *isLoaded() {
        return this.proxys.length > 0;
    }

    *postProcessProxyList() {
        
    }

    *loadConfigFromPath(force = false) {
        let path = this.configPath;
        if (this.isLoaded() && !force) {
            return this.proxys;
        }

        return axios.get(path).then((res) => {
            let document = yaml.parse(res.data);
            return this.extraClashConfig(document);
        });
    }

    *extraClashConfig(document) {
        let proxys = document?.proxies;
        if (!proxys || proxys.length == 0) {
            throw new Error('load config failed, no proxies found');
        }
        return proxys;
    }

    run() {
        if (!this.app) {
            this.app = express();
        }

        const server = this.app.listen(this.port, () => {
            let {address, port} = server.address();
            console.log(`service started, domain: http://${address}:${port}`);
        });
        return this.app;
    }
}

module.exports = AppCore;