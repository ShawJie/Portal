import type { ClashProxy } from '../types/proxy';
import type { PortalConfig, SourcePathConfig, CustomGroupConfig } from '../types/config';

export default class PortalConfigurationProperty {

    host: string;
    accessControl: boolean;
    sourcePaths: SourcePathConfig[];
    logLevel: string;
    refreshCron: string;
    proxys: ClashProxy[];
    include?: string;
    exclude?: string;
    customGroups: CustomGroupConfig[];

    constructor(configResource: PortalConfig) {
        const { 
            host = "http://localhost:8080", 
            sourcePaths, logLevel = "info",
            accessControl = false, 
            refreshCron = "0 15 3 * * *", 
            proxys = [], include, exclude, 
            customGroups = [] } = configResource;
        this.host = host;
        this.accessControl = accessControl;
        this.sourcePaths = sourcePaths || [];
        this.logLevel = logLevel;
        this.refreshCron = refreshCron;
        this.proxys = proxys;
        this.include = include;
        this.exclude = exclude;
        this.customGroups = customGroups;
    }
}
