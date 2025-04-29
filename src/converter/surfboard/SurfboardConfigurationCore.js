import SurfboardGeneral from "./SurfboardGeneral.js";
import SurfboardProxy from "./SurfboardProxy.js";
import SurfboardProxyGroup from "./SurfboardProxyGroup.js";
import SurfboardRule from "./SurfboardRule.js";

class SurfboardRuleObject {

    constructor(type, keyword, name) {
        this.type = type;
        this.keyword = keyword;
        this.name = name;
    }
}

class SurfboardConfigurationCore {

    static #INHERIT_RULE = [
        new SurfboardRuleObject("GEOIP", "CN", "DIRECT")
    ];

    #finalEndpoint;
    #titleComment;
    #generalSection;
    #proxySection;
    #proxyGroupSection;
    #ruleSection;

    constructor(finalEndpoint, titleComment = "") {
        this.#titleComment = titleComment;
        this.#generalSection = new SurfboardGeneral();
        this.#proxySection = new SurfboardProxy();
        this.#proxyGroupSection = new SurfboardProxyGroup();
        this.#ruleSection = new SurfboardRule();
        this.#finalEndpoint = finalEndpoint;
    }

    addProxy(key, proxy) {
        this.#proxySection.addProxy(key, proxy);
    }

    addGroup({name, type, endpoints, rules}) {
        this.#proxyGroupSection.addGroup({name, type, endpoints});
        if (rules && rules.length > 0) {
            rules.map(r => {return {type: r.type, keyword: r.keyword, name}})
                .forEach(e => this.#ruleSection.addRule(e));
        }
    }

    getConfig() {
        SurfboardConfigurationCore.#INHERIT_RULE.forEach(e => this.#ruleSection.addRule(e));
        this.#ruleSection.addFinalEndpoind(this.#finalEndpoint);

        const configObject = new Array();
        if (this.#titleComment) {
            configObject.push(this.#titleComment + "\n");
        }

        configObject.push(
            this.#generalSection.toString(), 
            this.#proxySection.toString(),
            this.#proxyGroupSection.toString(),
            this.#ruleSection.toString()
        );

        return configObject.join("\n\n");
    }
}

export default SurfboardConfigurationCore;
