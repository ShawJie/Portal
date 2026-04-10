interface ExperimentalConfig {
    clash?: {
        port: number;
        secret?: string;
    };
}

class SingboxExperimental {

    cacheFile: { enabled: boolean };
    clashApi?: { externalController: string; secret: string };

    constructor(expConf: ExperimentalConfig) {
        this.cacheFile = {
            enabled: true
        };

        if (expConf.clash) {
            const {clash: {port, secret = ""}} = expConf;
            this.clashApi = {
                externalController: `127.0.0.1:${port}`, secret
            };
        }
    }
}

export default SingboxExperimental;
