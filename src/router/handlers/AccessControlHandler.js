const { RequestHandler } = require("../ConvertRequestHandler");
const LoggerFactory = require("../../Logger")
const app = require("../../App");

class AccessControlHandler extends RequestHandler {

    #logger = LoggerFactory.child({module: "AccessControlHandler"});

    handle(req, res, next) {
        if (!app.accessControl()) {
            return next();
        }

        if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
            this.#logger.warn("Missing Authorization Header, %o", req.headers);
            return res.status(401).json({ message: 'Missing Authorization Header' });
        }
    
        // verify auth credentials
        const base64Credentials =  req.headers.authorization.split(' ')[1];
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

module.exports = AccessControlHandler;