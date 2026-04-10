import SurfboardAbstractConfigSection from "./SurfboardAbstractConfigSection";

class SurfboardProxyGroup extends SurfboardAbstractConfigSection {

    static readonly #DEFUALT_TEST_INTERVAL = "interval = 300";

    constructor() {
        super("Proxy Group");
    }

    addGroup({name, type, endpoints}: {name: string; type: string; endpoints: string[]}): void {
        const groupObject = [type, ...endpoints];
        if (type === 'url-test') {
            groupObject.push(SurfboardProxyGroup.#DEFUALT_TEST_INTERVAL);
        }
        this.addProperty(name, groupObject.join(SurfboardAbstractConfigSection.COMMON_SPECTOR));
    }
}

export default SurfboardProxyGroup;
