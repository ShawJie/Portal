const inheritRuleSetNames = {
    geositeCn: "geosite-cn",
    geositeAds: "geosite-ads"
}

const DEFAULT_RULESETS = [{
        tag: inheritRuleSetNames.geositeCn,
        format: "binary",
        url: "https://raw.githubusercontent.com/SagerNet/sing-geosite/rule-set/geosite-cn.srs"
    }, {
        tag: inheritRuleSetNames.geositeAds,
        format: "binary",
        url: "https://raw.githubusercontent.com/SagerNet/sing-geosite/rule-set/geosite-category-ads-all.srs"
    }
];

const DEFAULT_HEADLESS_RULES = [{
        outbound: "dns-out",
        protocol: "dns"
    }, {
        ruleSet: inheritRuleSetNames.geositeAds,
        outbound: "block"
    }, {
        ipIsPrivate: true,
        outbound: "direct",
    }, {
        clashMode: "direct",
        outbound: "direct"
    }, {
        ipCidr: [
            "192.168.0.0/16",
            "10.0.0.0/8",
            "172.16.0.0/12",
            "100.64.0.0/10",
            "17.0.0.0/8"
        ],
        outbound: "direct"
    }, {
        ruleSet: inheritRuleSetNames.geositeCn,
        outbound: "direct"
    }
];


class SingboxRoute {

    autoDetectInterface = true;
    ruleSet = new Array();
    rules = new Array();
    final;

    constructor (defaultDetour) {
        DEFAULT_RULESETS.forEach(e => this.addRuleSet({...e, downloadDetour: defaultDetour}));
        DEFAULT_HEADLESS_RULES.forEach(e => this.addHeadlessRule(e));

        this.final = defaultDetour;
        this.addHeadlessRule({clashMode: "global", outbound: defaultDetour});
    }

    addRuleSet({tag, format, url, downloadDetour}) {
        this.ruleSet.push({
            tag, format, url, downloadDetour,
            type: "remote"
        });
    }

    addHeadlessRule(customRule) {
        this.rules.push(customRule);
    }
}

module.exports = {
    SingboxRoute,
    inheritRuleSetNames
};