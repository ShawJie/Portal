export interface PluginOpts {
    mode: string;
    host: string;
}

export interface ClashProxy {
    name: string;
    type: 'ss' | 'http' | 'trojan' | 'anytls' | 'vmess';
    server: string;
    port: number;
    password?: string;
    cipher?: string;
    udp?: boolean;
    tls?: boolean;
    sni?: string;
    ws?: boolean;
    wsPath?: string;
    wsHeaders?: string;
    skipCertVerify?: boolean;
    uuid?: string;
    username?: string;
    vmessAead?: boolean;
    plugin?: string;
    pluginOpts?: PluginOpts;
    reuse?: boolean;
}
