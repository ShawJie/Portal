import { RequestHandler } from "../../ConvertRequestHandler.js";
import LoggerFactory from "../../../Logger.js";
import app from "../../../App.js";

export default class AccessControlHandler extends RequestHandler {

    #logger = LoggerFactory.child({module: "AccessControlHandler"});

    handle(req, res, next) {
        if (!app.accessControl()) {
            return next();
        }

        let credentialSupplier = () => req.headers.authorization.split(' ')[1];
        if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
            // try get authorize info from param
            let {token} = req.query;
            if (token && token !== '') {
                credentialSupplier = () => token;
            } else {
                this.#logger.warn("Missing Authorization Header, %o", req.headers);
                return res.status(401).json({ message: 'Missing Authorization Header' });
            }
        }
    
        // verify auth credentials
        const base64Credentials = credentialSupplier();
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');

        const [username, password] = credentials.split(':');
        const accessUser = {username, password};
        if (!app.inAccessSet(accessUser)) {
            this.#logger.warn("Access Denied, %s", credentials);
            return res.status(403).json({ message: 'Access Denied' });
        }

        req.accessUser = accessUser;
        next();
    }
}