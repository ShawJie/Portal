import SurfboardAbstractConfigSection from "./SurfboardAbstractConfigSection";

class SurfboardRule extends SurfboardAbstractConfigSection {

    constructor() {
        super("Rule");
    }

    addRule({type, keyword, name}: {type: string; keyword: string; name: string}): void {
        this.addDirectVal([type, keyword, name].join(SurfboardAbstractConfigSection.COMMON_SPECTOR));
    }

    addFinalEndpoind(endponit: string): void {
        this.addDirectVal(["FINAL", endponit].join(SurfboardAbstractConfigSection.COMMON_SPECTOR));
    }
}

export default SurfboardRule;
