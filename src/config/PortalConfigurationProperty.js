class PortalConfigurationProperty {

    constructor(configResource) {
        let { 
            host = "http://localhost:8080", 
            basePath,
            accessControl = false, 
            refreshCron = "0 15 3 * * *", 
            proxys = [], include, exclude, 
            customGroups = [] } = configResource;
        this.host = host;
        this.accessControl = accessControl;
        this.basePath = basePath;
        this.refreshCron = refreshCron;
        this.proxys = proxys;
        this.include = include;
        this.exclude = exclude;
        this.customGroups = customGroups;
    }
}

module.exports = PortalConfigurationProperty;