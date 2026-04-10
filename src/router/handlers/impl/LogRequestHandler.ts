import type { Request, Response } from 'express';
import { RequestHandler } from "../../ConvertRequestHandler";
import LoggerFactory from "../../../Logger";

export default class LogRequestHandler extends RequestHandler {

    private logger = LoggerFactory.child({module: "LogRequestHandler"});

    async handle(req: Request, res: Response, next: () => Promise<void>): Promise<void> {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        this.logger.info(`Request info: '${req.url}', Client address: '${ip}', User: '${req.accessUser?.username}'`);
        next();
    }
}
