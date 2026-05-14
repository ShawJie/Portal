import type { Request, Response } from 'express';
import { RequestHandler } from "../../RequestHandlerChain";
import LoggerFactory from "../../../Logger";
import app from "../../../App";

export default class AccessControlHandler extends RequestHandler {

    private logger = LoggerFactory.child({module: "AccessControlHandler"});

    async handle(req: Request, res: Response, next: () => Promise<void>): Promise<void> {
        if (!app.accessControl()) {
            return next();
        }

        let credentialSupplier = (): string => req.headers.authorization!.split(' ')[1];
        if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
            // try get authorize info from param
            const {token} = req.query as Record<string, string>;
            if (token && token !== '') {
                credentialSupplier = () => token;
            } else {
                this.logger.warn("Missing Authorization Header, %o", req.headers);
                res.status(401).json({ message: 'Missing Authorization Header' });
                return;
            }
        }
    
        // verify auth credentials
        const base64Credentials = credentialSupplier();
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');

        const [username, password] = credentials.split(':');
        const accessUser = {username, password};
        if (!app.inAccessSet(accessUser)) {
            this.logger.warn("Access Denied, %s", credentials);
            res.status(403).json({ message: 'Access Denied' });
            return;
        }

        req.accessUser = accessUser;
        next();
    }
}
