import type { Request, Response } from 'express';
import { RequestHandler } from "../../RequestHandlerChain";
import LoggerFactory from "../../../Logger";

export default class SessionAuthHandler extends RequestHandler {

    private static readonly PUBLIC_PATHS = new Set(['/api/login', '/api/session']);
    private logger = LoggerFactory.child({module: "SessionAuthHandler"});

    async handle(req: Request, res: Response, next: () => Promise<void>): Promise<void> {
        if (SessionAuthHandler.PUBLIC_PATHS.has(req.path)) {
            return next();
        }

        if (!req.session.adminUser) {
            this.logger.warn('Unauthorized access attempt to %s', req.path);
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        next();
    }
}
