import type { ClashProxy } from '../types/proxy';
import { ProxyGroupType, ProxyRuleType } from '../types/group';

class ProxyRule {

    type: string;
    keyword: string;

    constructor(type: string, keyword: string) {
        this.type = type;
        this.keyword = keyword;
    }
}

class ProxyGroup {
    
    name: string;
    type: string;
    filter?: RegExp | ((proxy: ClashProxy) => boolean);
    proxies: ClashProxy[];
    groups: string[];
    rules: ProxyRule[] | null;
    final: boolean;

    constructor(name: string, type: string, filter?: RegExp | ((proxy: ClashProxy) => boolean), rules?: ProxyRule[]) {
        this.name = name;
        this.type = type;
        this.filter = filter;
        this.proxies = [];
        this.groups = [];
        this.rules = rules || null;
        this.final = false;
    }

    addProxy(proxy: ClashProxy): void {
        if (typeof this.filter === 'function') {
            if (this.filter(proxy)) {
                this.proxies.push(proxy);
            }
        } else if (this.filter instanceof RegExp) {
            if (this.filter.test(proxy.name)) {
                this.proxies.push(proxy);
            }
        }
    }

    addGroup(groupName: string): ProxyGroup {
        this.groups.push(groupName);
        return this;
    }

    setAsFinal(): ProxyGroup {
        this.final = true;
        return this;
    }

    clear(): void {
        this.proxies = [];
    }

    clone(): ProxyGroup {
        const cloneObj = new ProxyGroup(this.name, this.type, this.filter, this.rules || undefined);
        cloneObj.proxies = this.proxies.slice();
        cloneObj.groups = this.groups.slice();
        cloneObj.final = this.final;
        return cloneObj;
    }

    isBlankGroup(): boolean {
        if (this.final || this.type === ProxyGroupType.DIRECT || this.type === ProxyGroupType.BLOCK) {
            return false;
        }
        return this.proxies.length === 0 && this.groups.length === 0;
    }
}

const DIRECT_GROUP = "直连";
const BLOCK_GROUP = "拦截";

function countriesNodeGroup(): ProxyGroup[] {
    const regions = [
        {
            name: '美洲',
            englishName: 'Americas',
            countries: ['US', 'CA', 'BR', 'MX', 'AR', 'CL', 'CO']
        },
        {
            name: '东亚',
            englishName: 'East Asia',
            countries: ['CN', 'JP', 'KR', 'TW', 'HK', 'MO']
        },
        {
            name: '东南亚',
            englishName: 'Southeast Asia',
            countries: ['SG', 'TH', 'VN', 'MY', 'ID', 'PH', 'MM', 'KH']
        },
        {
            name: '欧洲',
            englishName: 'Europe',
            countries: ['UK', 'DE', 'FR', 'NL', 'IT', 'ES', 'SE', 'NO', 
                       'PL', 'CH', 'BE', 'AT', 'FI', 'DK', 'PT', 'IE', 'RO', 'CZ']
        },
        {
            name: '西亚',
            englishName: 'West Asia',
            countries: ['TR', 'AE', 'IL', 'SA', 'BH', 'KW', 'QA']
        }
    ];

    const regionNamesInChinese = new Intl.DisplayNames('zh-CN', { type: "region" });
    const regionNamesInEnglish = new Intl.DisplayNames('en', { type: "region" });

    const specialNames: Record<string, string[]> = {
        'HK': ['香港'],
        'MO': ['澳门'],
        'TW': ['台湾'],
        'AE': ['阿联酋', 'UAE'],
        'SA': ['沙特'],
        'KR': ['Korea']
    };

    return regions.map(region => {
        const asciiPatterns: string[] = [];
        const nonAsciiPatterns: string[] = [];

        region.countries.forEach(code => {
            const chineseName = regionNamesInChinese.of(code) || '';
            const englishName = regionNamesInEnglish.of(code) || '';
            const names: string[] = [chineseName, englishName, code];

            if (specialNames[code]) {
                names.push(...specialNames[code]);
            }

            names.forEach(name => {
                if (/^[\x00-\x7F]+$/.test(name)) {
                    asciiPatterns.push(name);
                } else {
                    nonAsciiPatterns.push(name);
                }
            });
        });

        const parts: string[] = [];
        if (asciiPatterns.length > 0) {
            parts.push(`\\b(${asciiPatterns.join('|')})\\b`);
        }
        if (nonAsciiPatterns.length > 0) {
            parts.push(`(${nonAsciiPatterns.join('|')})`);
        }
        const regex = new RegExp(parts.join('|'), 'i');
        
        return new ProxyGroup(
            `${region.name}节点`,
            ProxyGroupType.URL_TEST,
            regex
        );
    });
}

const countriesNode = countriesNodeGroup();
const manualSelectGroup = new ProxyGroup("节点选择", ProxyGroupType.SELECT)
    .addGroup("自动选择").addGroup("手动切换").addGroup(DIRECT_GROUP).setAsFinal();

countriesNode.forEach(g => manualSelectGroup.addGroup(g.name));

const defaultGroups: ProxyGroup[] = [
    manualSelectGroup,
    new ProxyGroup("手动切换", ProxyGroupType.SELECT, new RegExp(".*")),
    new ProxyGroup("自动选择", ProxyGroupType.URL_TEST, new RegExp(".*")),
    ...countriesNode,
    new ProxyGroup(DIRECT_GROUP, ProxyGroupType.DIRECT),
    new ProxyGroup(BLOCK_GROUP, ProxyGroupType.BLOCK)
];

export {
    ProxyGroup,
    ProxyRule,
    ProxyGroupType,
    defaultGroups
};
