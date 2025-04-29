import logger from '../Logger.js';

export class RequestHandlerChain {

    constructor() {
        this.handlerChain = new Array();
    }

    /**
     * 
     * @param {RequestHandler} handler 
     */
    addHandler(handler) {
        this.handlerChain.push(handler);
        return this;
    }

    async handle(req, res) {
        if (this.handlerChain.length == 0) {
            return;
        }

        let cursor = 0;
        const doHandle = async () => {
            if (cursor < this.handlerChain.length) {
                let handler = this.handlerChain[cursor++];
                await handler.handle(req, res, doHandle);
            }
        }

        try {
            doHandle();
        } catch (err) {
            logger.error(err);
            res.status(500).end();
        }
    }
}

export class RequestHandler {

    async handle(req, res, next) {
        throw new Error("You have to implement the method doSomething!")
    }
}
