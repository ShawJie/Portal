const { inheritRuleSetNames } = require("./SingboxRoute");

const DEFAULT_DNS_SERVERS = [{
        tag: "dnspod",
        detour: "direct",
        address: "https://1.12.12.12/dns-query"
    }, {
        tag: "google",
        address: "https://8.8.8.8/dns-query"
    }, {
        tag: "block",
        address: "rcode://success"
    },
];

const DEFAULT_DNS_RULES = [{
        outbound: ["any"],
        server: "dnspod"
    }, {
        sourceIpIsPrivate: true,
        server: "local"
    }, {
        ruleSet: [inheritRuleSetNames.geositeAds],
        server: "block",
        disableCache: true
    }, {
        ruleSet: [inheritRuleSetNames.geositeCn],
        server: "dnspod"
    }, {
        ruleSet: [inheritRuleSetNames.geositeCn],
        invert: true,
        server: "google"
    }
]

class SingboxDns {
    
    strategy = "prefer_ipv4";
    servers = new Array();
    rules = new Array();

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

module.exports = SingboxDns;