import SurfboardGeneral from "./SurfboardGeneral";
import SurfboardProxy from "./SurfboardProxy";
import SurfboardProxyGroup from "./SurfboardProxyGroup";
import SurfboardRule from "./SurfboardRule";
import type { ClashProxy } from "../../types/proxy";
import type { ProxyRule } from "../../entry/Grouper";

class SurfboardRuleObject {

    type: string;
    keyword: string;
    name: string;

    constructor(type: string, keyword: string, name: string) {
        this.type = type;
        this.keyword = keyword;
        this.name = name;
    }
}

interface SurfboardGroupWrapper {
    name: string;
    type: string;
    endpoints: string[];
    rules?: ProxyRule[];
}

class SurfboardConfigurationCore {

    static readonly #INHERIT_RULE = [
        new SurfboardRuleObject("GEOIP", "CN", "DIRECT")
    ];

    private finalEndpoint: string;
    private titleComment: string;
    private generalSection: SurfboardGeneral;
    private proxySection: SurfboardProxy;
    private proxyGroupSection: SurfboardProxyGroup;
    private ruleSection: SurfboardRule;

    constructor(finalEndpoint: string, titleComment: string = "") {
        this.titleComment = titleComment;
        this.generalSection = new SurfboardGeneral();
        this.proxySection = new SurfboardProxy();
        this.proxyGroupSection = new SurfboardProxyGroup();
        this.ruleSection = new SurfboardRule();
        this.finalEndpoint = finalEndpoint;
    }

    addProxy(key: string, proxy: ClashProxy): void {
        this.proxySection.addProxy(key, proxy);
    }

    addGroup({name, type, endpoints, rules}: SurfboardGroupWrapper): void {
        this.proxyGroupSection.addGroup({name, type, endpoints});
        if (rules && rules.length > 0) {
            rules.map(r => ({type: r.type, keyword: r.keyword, name}))
                .forEach(e => this.ruleSection.addRule(e));
        }
    }

    getConfig(): string {
        SurfboardConfigurationCore.#INHERIT_RULE.forEach(e => this.ruleSection.addRule(e));
        this.ruleSection.addFinalEndpoind(this.finalEndpoint);

        const configObject: string[] = [];
        if (this.titleComment) {
            configObject.push(this.titleComment + "\n");
        }

        configObject.push(
            this.generalSection.toString(), 
            this.proxySection.toString(),
            this.proxyGroupSection.toString(),
            this.ruleSection.toString()
        );

        return configObject.join("\n\n");
    }
}

export default SurfboardConfigurationCore;
