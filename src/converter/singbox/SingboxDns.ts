import { inheritRuleSetNames } from "./SingboxRoute";

const DEFAULT_DNS_SERVERS = [
    {
        tag: "dns-direct",
        detour: "direct",
        address: "https://1.12.12.12/dns-query",
        addressResolver: "dns-local",
    }, 
    {
        tag: "dns-remote",
        address: "https://1.1.1.1/dns-query",
        addressResolver: "dns-local"
    }, 
    {
        tag: "dns-block",
        address: "rcode://success",
    },
    {
        tag: "dns-local",
        address: "local",
        detour: "direct"
    },
    {
        tag: "dns-fakeip",
        address: "fakeip"
    }
];

const DEFAULT_DNS_RULES: Record<string, unknown>[] = [
    {
        outbound: "direct",
        server: "dns-direct"
    },
    {
        outbound: "any",
        server: "dns-direct"
    },
    {
        domainSuffix: [
            ".arpa",
            ".arpa."
        ],
        server: "dns-block"
    },
    {
        ruleSet: [inheritRuleSetNames.geositeAds],
        server: "dns-block",
        disableCache: true
    },
    {
        ruleSet: [inheritRuleSetNames.geositeCn],
        server: "dns-direct"
    },
    {
        query_type: ["A", "AAAA"],
        server: "dns-fakeip"
    }
];

class SingboxDns {
    
    final: string = "dns-remote";
    strategy: string = "prefer_ipv4";
    reverseMapping: boolean = true;
    independentCache: boolean = true;

    servers: Record<string, unknown>[] = [];
    rules: Record<string, unknown>[] = [];
    fakeip: SingboxDnsFakeip = new SingboxDnsFakeip();

    constructor() {
        DEFAULT_DNS_SERVERS.forEach(e => this.addServer(e));
        DEFAULT_DNS_RULES.forEach(e => this.addRule(e));
    }

    addServer({tag, address, detour}: {tag: string; address: string; detour?: string}): void {
        this.servers.push({
            tag, address, detour
        });
    }

    addRule(serverRule: Record<string, unknown>): void {
        this.rules.push(serverRule);
    }
}

class SingboxDnsFakeip {
    enabled: boolean = true;
    inet4Range: string = "198.18.0.0/15";
    inet6Range: string = "fc00::/18";
}

export default SingboxDns;
