class SurfboardAbstractConfigSection {

    static #NEW_LINE_MARK = "\n";
    static COMMON_SPECTOR = ",";

    constructor (name) {
        this.name = name;
        this.properties = new Array();
    }

    addProperty(key, value) {
        this.properties.push({key, value});
    }

    addDirectVal(val) {
        this.properties.push(val);
    }

    toString() {
        const sectionContent = new Array();
        sectionContent.push(`[${this.name}]`, SurfboardAbstractConfigSection.#NEW_LINE_MARK);
        for (const property of this.properties) {
            sectionContent.push(
                (typeof property === "string" ? property : `${property.key} = ${property.value}`),
                SurfboardAbstractConfigSection.#NEW_LINE_MARK
            );
        }
        return sectionContent.join("");
    }
}

export default SurfboardAbstractConfigSection;
