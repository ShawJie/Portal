import SingboxDns from "./SingboxDns";
import SingboxExperimental from "./SingboxExperimental";
import SingboxOutbounds from "./SingboxOutbounds";
import {SingboxRoute} from "./SingboxRoute";
import type { ClashProxy } from "../../types/proxy";

interface SingboxGroupInput {
    name: string;
    type: string;
    outbounds: string[];
    rules?: {type: string; keyword: string}[];
}

class SingboxConfigurationCore {
    
    private log: SingboxLog;
    private dns: SingboxDns;
    private inbounds: SingboxInbounds;
    private outbounds: SingboxOutbounds;
    private route: SingboxRoute;
    private experimental: SingboxExperimental;
    
    constructor(defaultDetour: string, logLevel: string = "warn") {
        this.log = new SingboxLog(logLevel);
        this.dns = new SingboxDns();
        this.inbounds = FORCE_INBOUNDS.reduce((p, c) => p.addInbound(c), new SingboxInbounds());
        this.outbounds = new SingboxOutbounds().doInitial();
        this.route = new SingboxRoute(defaultDetour);
        this.experimental = new SingboxExperimental({
            clash: {
                port: 9090
            }
        });
    }

    addProxy(key: string, proxy: Record<string, unknown>): void {
        this.outbounds.addProxy(key, proxy as unknown as ClashProxy);
    }

    addGroup({name, type, outbounds, rules}: SingboxGroupInput): void {
        this.outbounds.addGroup({name, type, outbounds});
        if (rules && rules.length > 0) {
            const subRule: Record<string, unknown> = {outbound: name};
            for (const rule of rules) {
                const ruleType = rule.type;
                if (!subRule[ruleType]) {
                    subRule[ruleType] = [];
                }
                (subRule[ruleType] as string[]).push(rule.keyword);
            }
            this.route.addHeadlessRule(subRule);
        }
    }

    getConfig(): Record<string, unknown> {
        return {
            log: this.log,
            dns: this.dns,
            inbounds: this.inbounds,
            outbounds: this.outbounds,
            route: this.route,
            experimental: this.experimental
        };
    }
}

class SingboxLog {

    static readonly #legalLevelSet = ["trace", "debug", "info", "warn", "error", "fatal", "panic"];
    timestamp: boolean = true;
    level: string;

    constructor (level: string) {
        if (SingboxLog.#legalLevelSet.indexOf(level) < 0) {
            throw new Error("illegal log level");
        }
        this.level = level;
    }
}


// nothing to care
class SingboxInbounds extends Array<Record<string, unknown>> {
    addInbound(item: Record<string, unknown>): SingboxInbounds {
        this.push(item);
        return this;
    }
}

const FORCE_INBOUNDS: Record<string, unknown>[] = [
    {
        autoRoute: true,
        domainStrategy: "prefer_ipv4",
        endpointIndependentNat: true,
        mtu: 9000,
        sniff: true,
        sniffOverrideDestination: true,
        stack: "system",
        strictRoute: true,
        type: "tun",
        inet4Address: "172.19.0.1/30"
    },
    {
        domainStrategy: "prefer_ipv4",
        listen: "127.0.0.1",
        listenPort: 7891,
        sniff: true,
        sniffOverrideDestination: true,
        tag: "socks-in",
        type: "socks",
        users: []
    },
    {
        domainStrategy: "prefer_ipv4",
        listen: "127.0.0.1",
        listenPort: 7890,
        sniff: true,
        sniffOverrideDestination: true,
        tag: "mixed-in",
        type: "mixed",
        users: []
    }
];

export default SingboxConfigurationCore;
