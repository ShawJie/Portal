import type { Request, Response } from 'express';
import logger from '../Logger';

export class RequestHandlerChain {

    private handlerChain: RequestHandler[];

    constructor() {
        this.handlerChain = [];
    }

    addHandler(handler: RequestHandler): RequestHandlerChain {
        this.handlerChain.push(handler);
        return this;
    }

    async handle(req: Request, res: Response): Promise<void> {
        if (this.handlerChain.length === 0) {
            return;
        }

        let cursor = 0;
        const doHandle = async (): Promise<void> => {
            if (cursor < this.handlerChain.length) {
                const handler = this.handlerChain[cursor++];
                await handler.handle(req, res, doHandle);
            }
        };

        try {
            doHandle();
        } catch (err) {
            logger.error(err);
            res.status(500).end();
        }
    }
}

export abstract class RequestHandler {

    abstract handle(req: Request, res: Response, next: () => Promise<void>): Promise<void>;
}
