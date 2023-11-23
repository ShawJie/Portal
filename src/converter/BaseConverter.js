class BaseConverter {
    
    constructor(outputName) {
        this.outputName = outputName;
    }

    getOutputName() {
        return this.outputName;
    }

    async export(userinfo) {
        throw new Error('You have to implement the method doSomething!');
    }

    _clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    _kebabize(str) {
        return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();;
    }
}

module.exports = BaseConverter;