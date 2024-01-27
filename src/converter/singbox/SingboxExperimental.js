class SingboxExperimental {

    cacheFile;
    clashApi;

    constructor(expConf) {
        this.cacheFile = {
            enabled: true
        };

        if (expConf.clash) {
            const {clash: {port, secret = ""}} = expConf;
            this.clashApi = {
                externalController: `127.0.0.1:${port}`, secret
            }
        }
    }
}

module.exports = SingboxExperimental;