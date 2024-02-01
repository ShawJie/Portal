const SurfboardAbstractConfigSection = require("./SurfboardAbstractConfigSection");

class SurfboardRule extends SurfboardAbstractConfigSection {

    constructor() {
        super("Rule");
    }

    addRule({type, keyword, name}) {
        this.addDirectVal([type, keyword, name].join(SurfboardAbstractConfigSection.COMMON_SPECTOR));
    }

    addFinalEndpoind(endponit) {
        this.addDirectVal(["FINAL", endponit].join(SurfboardAbstractConfigSection.COMMON_SPECTOR));
    }
}

module.exports = SurfboardRule;