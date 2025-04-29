export default class PortalConfigurationProperty {

    constructor(configResource) {
        let { 
            host = "http://localhost:8080", 
            basePath, logLevel = "info",
            accessControl = false, 
            refreshCron = "0 15 3 * * *", 
            proxys = [], include, exclude, 
            customGroups = [] } = configResource;
        this.host = host;
        this.accessControl = accessControl;
        this.basePath = basePath;
        this.logLevel = logLevel;
        this.refreshCron = refreshCron;
        this.proxys = proxys;
        this.include = include;
        this.exclude = exclude;
        this.customGroups = customGroups;
    }
}