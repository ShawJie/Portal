class BaseController {
    
    constructor(outputName) {
        this.outputName = outputName;
    }

    async export() {
        throw new Error('You have to implement the method doSomething!');
    }

    _clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    _kebabize(str) {
        return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();;
    }
}

module.exports = BaseController;