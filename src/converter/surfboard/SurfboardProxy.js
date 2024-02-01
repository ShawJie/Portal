const SurfboardAbstractConfigSection = require("./SurfboardAbstractConfigSection");

class SurfboardProxy extends SurfboardAbstractConfigSection {

    constructor() {
        super("Proxy");
    }

    addProxy(key, proxy) {
        const proxyObject = new Array();
        let {type, server, port, password} = proxy;
        switch (type) {
            case 'ss':
                proxyObject.push(
                    "ss", server, port, `encrypt-method=${proxy.cipher}`,
                    `password=${password}`, `udp-relay=${proxy.udp}`, `obfs=${proxy['plugin-opts'].mode}`,
                    `obfs-host=${proxy['plugin-opts'].host}`
                );
                break;
            case 'http':
                proxyObject.push(
                    proxy.tls ? 'https' : 'http', server, port,
                    proxy.username, password
                );
                if (proxy.tls) {
                    proxyObject.push(`skip-cert-verify=${proxy.skipCertVerify ?? false}`);
                }
                break;
        }
        this.addProperty(key, proxyObject.join(SurfboardAbstractConfigSection.COMMON_SPECTOR));
    }
}

module.exports = SurfboardProxy;