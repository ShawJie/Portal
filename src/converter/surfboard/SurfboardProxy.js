import SurfboardAbstractConfigSection from "./SurfboardAbstractConfigSection.js";

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
                    `password=${password}`, `udp-relay=${proxy.udp}`
                );
                if (proxy["plugin-opts"]) {
                    proxyObject.push(`obfs=${proxy['plugin-opts'].mode}`, `obfs-host=${proxy['plugin-opts'].host}`);
                }
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
            case 'trojan':
                proxyObject.push('trojan', server, port, `password=${password}`);
                if (proxy.udp !== undefined) {
                    proxyObject.push(`udp-relay=${proxy.udp}`);
                }
                if (proxy['skip-cert-verify'] !== undefined) {
                    proxyObject.push(`skip-cert-verify=${proxy['skip-cert-verify']}`);
                }
                if (proxy.sni) {
                    proxyObject.push(`sni=${proxy.sni}`);
                }
                if (proxy.ws) {
                    proxyObject.push(`ws=${proxy.ws}`);
                }
                if (proxy['ws-path']) {
                    proxyObject.push(`ws-path=${proxy['ws-path']}`);
                }
                if (proxy['ws-headers']) {
                    proxyObject.push(`ws-headers=${proxy['ws-headers']}`);
                }
                break;
        }
        this.addProperty(key, proxyObject.join(SurfboardAbstractConfigSection.COMMON_SPECTOR));
    }
}

export default SurfboardProxy;
