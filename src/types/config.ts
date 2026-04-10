import type { ClashProxy } from './proxy';

export interface SourcePathConfig {
    name: string;
    url: string;
}

export interface CustomRuleConfig {
    ruleType: string;
    keyword: string;
}

export interface CustomGroupConfig {
    groupName: string;
    type: string;
    proxys?: string;
    rules?: CustomRuleConfig[];
    attachGroup?: string[];
}

export interface PortalConfig {
    host?: string;
    accessControl?: boolean;
    sourcePaths?: SourcePathConfig[];
    logLevel?: string;
    refreshCron?: string;
    proxys?: ClashProxy[];
    include?: string;
    exclude?: string;
    customGroups?: CustomGroupConfig[];
}
