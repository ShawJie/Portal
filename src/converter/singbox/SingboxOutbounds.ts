import type { ClashProxy } from "../../types/proxy";

const INHERIT_OUTBOUNDS: Record<string, unknown>[] = [{
    tag: "dns-out",
    type: "dns"
}, {
    tag: "direct",
    type: "direct"
}, {
    tag: "block",
    type: "block"
}];

class SingboxOutbounds extends Array<Record<string, unknown>> {

    doInitial(): SingboxOutbounds {
        INHERIT_OUTBOUNDS.forEach(e => this.push(e));
        return this;
    }

    addProxy(key: string, proxy: ClashProxy): void {
        let proxyObject: Record<string, unknown> | null = null;
        const {type, server, port, password} = proxy;
        switch (type) {
            case "ss": {
                const {cipher, plugin} = proxy;
                proxyObject = {
                    password, server, serverPort: port, 
                    tag: key, type: "shadowsocks", method: cipher
                };

                if (plugin) {
                    const pOpts = proxy.pluginOpts;
                    switch (plugin) {
                        case 'obfs':
                            proxyObject.plugin = "obfs-local";
                            proxyObject.pluginOpts = `obfs=${pOpts?.mode};obfs-host=${pOpts?.host}`;
                            break;
                    }
                }
                break;
            }
            case "http": {
                const {username, tls, skipCertVerify} = proxy;
                proxyObject = {password, server, server_port: port, tag: key, type: 'http', username};
                if (tls) {
                    proxyObject.tls = {
                        enabled: true,
                        insecure: skipCertVerify ?? false
                    };
                }
                break;
            }
            case "vmess": {
                const {uuid, username, tls, skipCertVerify, sni, ws, wsPath, wsHeaders, vmessAead} = proxy;
                proxyObject = {
                    server, server_port: port, tag: key, type: "vmess",
                    uuid: uuid || username,
                    security: "auto",
                    alter_id: vmessAead === false ? 1 : 0,
                    global_padding: false,
                    authenticated_length: true,
                };
                if (tls) {
                    proxyObject.tls = {
                        enabled: true,
                        insecure: skipCertVerify ?? false,
                        ...(sni ? {server_name: sni} : {})
                    };
                }
                if (ws) {
                    proxyObject.transport = {
                        type: "ws",
                        ...(wsPath ? {path: wsPath} : {}),
                        ...(wsHeaders ? {headers: {Host: wsHeaders}} : {})
                    };
                }
                break;
            }
            case "trojan": {
                const {skipCertVerify, sni, ws, wsPath, wsHeaders} = proxy;
                proxyObject = {
                    password, server, server_port: port, tag: key, type: "trojan",
                };
                proxyObject.tls = {
                    enabled: true,
                    insecure: skipCertVerify ?? false,
                    ...(sni ? {server_name: sni} : {})
                };
                if (ws) {
                    proxyObject.transport = {
                        type: "ws",
                        ...(wsPath ? {path: wsPath} : {}),
                        ...(wsHeaders ? {headers: {Host: wsHeaders}} : {})
                    };
                }
                break;
            }
            case "anytls": {
                const {skipCertVerify, sni} = proxy;
                proxyObject = {
                    password, server, server_port: port, tag: key, type: "anytls",
                };
                proxyObject.tls = {
                    enabled: true,
                    insecure: skipCertVerify ?? false,
                    ...(sni ? {server_name: sni} : {})
                };
                break;
            }
        }

        if (proxyObject) {
            this.push(proxyObject);
        }
    }

    addGroup({name, type, outbounds}: {name: string; type: string; outbounds: string[]}): void {
        this.push({tag: name, type, outbounds});
    }
}

export default SingboxOutbounds;
