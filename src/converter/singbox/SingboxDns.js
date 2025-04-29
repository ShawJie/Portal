import { inheritRuleSetNames } from "./SingboxRoute.js";

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

const DEFAULT_DNS_RULES = [
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
]

class SingboxDns {
    
    final = "dns-remote";
    strategy = "prefer_ipv4";
    reverseMapping = true;
    independentCache = true;

    servers = new Array();
    rules = new Array();
    fakeip = new SingboxDnsFakeip();

    constructor() {
        DEFAULT_DNS_SERVERS.forEach(e => this.addServer(e));
        DEFAULT_DNS_RULES.forEach(e => this.addRule(e));
    }

    addServer({tag, address, detour}) {
        this.servers.push({
            tag, address, detour
        });
    }

    addRule(serverRule) {
        this.rules.push(serverRule);
    }
}

class SingboxDnsFakeip {
    enabled = true;
    inet4Range =  "198.18.0.0/15";
    inet6Range = "fc00::/18";
}

export default SingboxDns;
