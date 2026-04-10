import type { ClashProxy } from '../types/proxy';
import type { AggregatedResource } from '../types/group';
import { defaultGroups, ProxyGroup, ProxyRule } from './Grouper';
import type { CustomGroupConfig } from '../types/config';

class AggregationProxy {

    private proxies: Map<string, ClashProxy>;
    private groups: ProxyGroup[];

    constructor({customGroups}: {customGroups?: CustomGroupConfig[]}) {
        this.proxies = new Map();
        this.groups = [...defaultGroups];
        if (customGroups) {
            for (const {groupName, type, proxys, rules, attachGroup} of customGroups) {
                let wrapperRules: ProxyRule[] | undefined;
                if (rules) {
                    wrapperRules = [];
                    for (const {ruleType, keyword} of rules) {
                        wrapperRules.push(new ProxyRule(ruleType, keyword));
                    }
                }

                const curGroupInst = new ProxyGroup(
                    groupName, type, proxys ? new RegExp(proxys) : undefined, wrapperRules);
                if (attachGroup) {
                    attachGroup.forEach((group) => {
                        curGroupInst.addGroup(group);
                    });
                }

                this.groups.push(curGroupInst);
            }
        }
    }

    addProxy(proxy: ClashProxy): void {
        if (this.proxies.has(proxy.name)) {
            return;
        }

        this.proxies.set(proxy.name, proxy);
        this.groups.forEach((group) => {
            group.addProxy(proxy);
        });
    }

    refresh(proxies: ClashProxy[]): void {
        if (proxies && proxies.length > 0) {
            this.clearProxies();

            proxies.forEach((proxy) => {
                this.addProxy(proxy);
            });
        }
    }

    private clearProxies(): void {
        this.proxies.clear();
        this.groups.forEach((group) => {
            group.clear();
        });
    }

    private activeGroup(originGroup: ProxyGroup[]): ProxyGroup[] {
        const activeGroups = originGroup.map(g => g.clone());

        const dropCandidate = activeGroups.reduce((set, group) => 
            group.isBlankGroup() ? set.add(group.name) : set
        , new Set<string>());
        if (dropCandidate.size === 0) {
            return activeGroups;
        }

        const filtered = activeGroups.filter(g => !dropCandidate.has(g.name));
        filtered.forEach(activeGroup => {
            activeGroup.groups = activeGroup.groups.filter(gName => !dropCandidate.has(gName));
        });
        return this.activeGroup(filtered);
    }

    resource(): AggregatedResource {
        return {
            proxies: this.proxies,
            groups: this.activeGroup(this.groups)
        };
    }

    isEmpty(): boolean {
        return this.proxies.size === 0;
    }
}

export default AggregationProxy;
