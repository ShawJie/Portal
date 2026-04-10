import SurfboardAbstractConfigSection from "./SurfboardAbstractConfigSection";
import type { ClashProxy } from "../../types/proxy";

class SurfboardProxy extends SurfboardAbstractConfigSection {

    constructor() {
        super("Proxy");
    }

    addProxy(key: string, proxy: ClashProxy): void {
        const proxyObject: (string | number | boolean)[] = [];
        const {type, server, port, password} = proxy;
        switch (type) {
            case 'ss':
                proxyObject.push(
                    "ss", server, port, `encrypt-method=${proxy.cipher}`,
                    `password=${password}`, `udp-relay=${proxy.udp}`
                );
                if (proxy.pluginOpts) {
                    proxyObject.push(`obfs=${proxy.pluginOpts.mode}`, `obfs-host=${proxy.pluginOpts.host}`);
                }
                break;
            case 'http':
                proxyObject.push(
                    proxy.tls ? 'https' : 'http', server, port,
                    proxy.username || '', password || ''
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
                if (proxy.skipCertVerify !== undefined) {
                    proxyObject.push(`skip-cert-verify=${proxy.skipCertVerify}`);
                }
                if (proxy.sni) {
                    proxyObject.push(`sni=${proxy.sni}`);
                }
                if (proxy.ws) {
                    proxyObject.push(`ws=${proxy.ws}`);
                }
                if (proxy.wsPath) {
                    proxyObject.push(`ws-path=${proxy.wsPath}`);
                }
                if (proxy.wsHeaders) {
                    proxyObject.push(`ws-headers=${proxy.wsHeaders}`);
                }
                break;
            case 'anytls':
                proxyObject.push('anytls', server, port, password || '');
                if (proxy.skipCertVerify !== undefined) {
                    proxyObject.push(`skip-cert-verify=${proxy.skipCertVerify}`);
                }
                if (proxy.sni) {
                    proxyObject.push(`sni=${proxy.sni}`);
                }
                if (proxy.reuse !== undefined) {
                    proxyObject.push(`reuse=${proxy.reuse}`);
                }
                break;
            case 'vmess':
                proxyObject.push('vmess', server, port, `username=${proxy.uuid || proxy.username}`);
                if (proxy.udp !== undefined) {
                    proxyObject.push(`udp-relay=${proxy.udp}`);
                }
                if (proxy.ws !== undefined) {
                    proxyObject.push(`ws=${proxy.ws}`);
                }
                if (proxy.tls !== undefined) {
                    proxyObject.push(`tls=${proxy.tls}`);
                }
                if (proxy.wsPath) {
                    proxyObject.push(`ws-path=${proxy.wsPath}`);
                }
                if (proxy.wsHeaders) {
                    proxyObject.push(`ws-headers=${proxy.wsHeaders}`);
                }
                if (proxy.skipCertVerify !== undefined) {
                    proxyObject.push(`skip-cert-verify=${proxy.skipCertVerify}`);
                }
                if (proxy.sni) {
                    proxyObject.push(`sni=${proxy.sni}`);
                }
                if (proxy.vmessAead !== undefined) {
                    proxyObject.push(`vmess-aead=${proxy.vmessAead}`);
                }
                break;
        }
        this.addProperty(key, proxyObject.join(SurfboardAbstractConfigSection.COMMON_SPECTOR));
    }
}

export default SurfboardProxy;
