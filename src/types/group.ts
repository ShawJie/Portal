import type { ClashProxy } from './proxy';
import type { ProxyGroup } from '../entry/Grouper';

export enum ProxyGroupType {
    URL_TEST = "url-test",
    SELECT = "select",
    DIRECT = "direct",
    BLOCK = "block",
}

export enum ProxyRuleType {
    DOMAIN = "DOMAIN",
    DOMAIN_SUFFIX = "DOMAIN-SUFFIX",
    DOMAIN_KEYWORD = "DOMAIN-KEYWORD",
    IP_CIDR = "IP-CIDR",
}

export interface AggregatedResource {
    proxies: Map<string, ClashProxy>;
    groups: ProxyGroup[];
}
