const inheritRuleSetNames = {
    geositeCn: "geosite-cn",
    geoIpCn: "geoip-cn",
    geositeAds: "geosite-ads"
};

const DEFAULT_RULESETS = [{
        tag: inheritRuleSetNames.geositeCn,
        format: "binary",
        url: "https://raw.githubusercontent.com/SagerNet/sing-geosite/rule-set/geosite-cn.srs"
    }, {
        tag: inheritRuleSetNames.geositeAds,
        format: "binary",
        url: "https://raw.githubusercontent.com/SagerNet/sing-geosite/rule-set/geosite-category-ads-all.srs"
    }, {
        tag: inheritRuleSetNames.geoIpCn,
        format: "binary",
        url: "https://raw.githubusercontent.com/SagerNet/sing-geoip/rule-set/geoip-cn.srs"
    }
];

const DEFAULT_HEADLESS_RULES: Record<string, unknown>[] = [{
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
        ruleSet: [
            inheritRuleSetNames.geositeCn,
            inheritRuleSetNames.geoIpCn
        ],
        outbound: "direct"
    }
];


class SingboxRoute {

    autoDetectInterface: boolean = true;
    ruleSet: Record<string, unknown>[] = [];
    rules: Record<string, unknown>[] = [];
    final: string;

    constructor (defaultDetour: string) {
        DEFAULT_RULESETS.forEach(e => this.addRuleSet({...e, downloadDetour: defaultDetour}));
        DEFAULT_HEADLESS_RULES.forEach(e => this.addHeadlessRule(e));

        this.final = defaultDetour;
        this.addHeadlessRule({clashMode: "global", outbound: defaultDetour});
    }

    addRuleSet({tag, format, url, downloadDetour}: {tag: string; format: string; url: string; downloadDetour: string}): void {
        this.ruleSet.push({
            tag, format, url, downloadDetour,
            type: "remote"
        });
    }

    addHeadlessRule(customRule: Record<string, unknown>): void {
        this.rules.push(customRule);
    }
}

export {
    SingboxRoute,
    inheritRuleSetNames
};
