class PortalConfigurationProperty {

    constructor(configResource) {
        let { 
            host, basePath, accessSet, refreshCron = "0 15 3 * * *", 
            proxys, include, exclude, 
            customGroups } = configResource;
        this.host = host;
        this.accessSet = new Set(accessSet ?? []);
        this.basePath = basePath;
        this.refreshCron = refreshCron;
        this.proxys = proxys;
        this.include = include;
        this.exclude = exclude;
        this.customGroups = customGroups;
    }
}

module.exports = PortalConfigurationProperty;