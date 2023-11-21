class BaseController {
    
    constructor(outputName) {
        this.outputName = outputName;
    }

    async export() {
        throw new Error('You have to implement the method doSomething!');
    }
}

module.exports = BaseController;