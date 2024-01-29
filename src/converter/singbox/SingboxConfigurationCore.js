const SingboxDns = require("./SingboxDns");
const SingboxExperimental = require("./SingboxExperimental");
const SingboxOutbounds = require("./SingboxOutbounds");
const {SingboxRoute} = require("./SingboxRoute");

class SingboxConfigurationCore {
    
    #log;
    #dns;
    #inbounds;
    #outbounds;
    #route;
    #experimental;
    
    constructor(defaultDetour, logLevel = "warn") {
        this.#log = new SingboxLog(logLevel);
        this.#dns = new SingboxDns();
        this.#inbounds = FORCE_INBOUNDS.reduce((p, c) => p.addInbound(c), new SingboxInbounds())
        this.#outbounds = new SingboxOutbounds().doInitial();
        this.#route = new SingboxRoute(defaultDetour);
        this.#experimental = new SingboxExperimental({
            clash: {
                port: 9090
            }
        });
    }

    addProxy(key, proxy) {
        this.#outbounds.addProxy(key, proxy);
    }

    addGroup({name, type, outbounds, rules}) {
        this.#outbounds.addGroup({name, type, outbounds});
        if (rules && rules.length > 0) {
            let subRule = {outbound: name};
            for (const rule of rules) {
                let ruleType = rule.type;
                if (!subRule[ruleType]) {
                    subRule[ruleType] = new Array();
                }
                subRule[ruleType].push(rule.keyword);
            }
            this.#route.addHeadlessRule(subRule);
        }
    }

    getConfig() {
        return {
            log: this.#log,
            dns: this.#dns,
            inbounds: this.#inbounds,
            outbounds: this.#outbounds,
            route: this.#route,
            experimental: this.#experimental
        }
    }
}

class SingboxLog {

    static #legalLevelSet = ["trace", "debug", "info", "warn", "error", "fatal", "panic"];
    timestamp = true;

    constructor (level) {
        if (SingboxLog.#legalLevelSet.indexOf(level) < 0) {
            throw new Error("illegal log level");
        }
        this.level = level;
    }
}


// nothing to care
class SingboxInbounds extends Array {
    addInbound(item) {
        this.push(item);
        return this;
    }
};

const FORCE_INBOUNDS = [
    {
        sniffOverrideDestination: true,
        sniff: true,
        endpointIndependentNat: true,
        strictRoute: true,
        autoRoute: true,
        mtu: 1500,
        inet4Address: "172.19.0.1/30",
        interfaceName: "tun0",
        domainStrategy: "prefer_ipv4",
        tag: "tun-in",
        type: "tun"
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

module.exports = SingboxConfigurationCore;