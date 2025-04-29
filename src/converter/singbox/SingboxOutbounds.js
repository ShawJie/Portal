const INHERIT_OUTBOUNDS = [{
    tag: "dns-out",
    type: "dns"
}, {
    tag: "direct",
    type: "direct"
}, {
    tag: "block",
    type: "block"
}];

class SingboxOutbounds extends Array {

    doInitial() {
        INHERIT_OUTBOUNDS.forEach(e => this.push(e));
        return this;
    }

    addProxy(key, proxy) {
        let proxyObject = null;
        const {type, server, port, password} = proxy;
        switch (type) {
            case "ss":
                const {cipher, plugin} = proxy;
                proxyObject = {
                    password, server, serverPort: port, 
                    tag: key, type: "shadowsocks", method: cipher
                };

                if (plugin) {
                    let pluginOpts = proxy['plugin-opts'];
                    switch (plugin) {
                        case 'obfs':
                            proxyObject.plugin = "obfs-local";
                            proxyObject.pluginOpts = `obfs=${pluginOpts.mode};obfs-host=${pluginOpts.host}`;
                            break;
                    }
                }
                break;
            case "http":
                let {username, tls, skipCertVerify} = proxy;
                proxyObject = {password, server, server_port: port, tag: key, type: 'http', username};
                if (tls) {
                    proxyObject.tls = {
                        enabled: true,
                        insecure: skipCertVerify ?? false
                    };
                }
                break;
        }

        if (proxyObject) {
            this.push(proxyObject);
        }
    }

    addGroup({name, type, outbounds}) {
        this.push({tag: name, type, outbounds});
    }
}

export default SingboxOutbounds;
