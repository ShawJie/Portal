class SurfboardAbstractConfigSection {

    static readonly #NEW_LINE_MARK = "\n";
    static readonly COMMON_SPECTOR = ",";

    protected name: string;
    protected properties: (string | {key: string; value: string})[];

    constructor (name: string) {
        this.name = name;
        this.properties = [];
    }

    addProperty(key: string, value: string): void {
        this.properties.push({key, value});
    }

    addDirectVal(val: string): void {
        this.properties.push(val);
    }

    toString(): string {
        const sectionContent: string[] = [];
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
