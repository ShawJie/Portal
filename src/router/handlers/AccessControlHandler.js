const { RequestHandler } = require("../ConvertRequestHandler");
const app = require("../../App");

class AccessControlHandler extends RequestHandler {

    handle(req, res, next) {
        if (!app.accessControl()) {
            return next();
        }

        if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
            return res.status(401).json({ message: 'Missing Authorization Header' });
        }
    
        // verify auth credentials
        const base64Credentials =  req.headers.authorization.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        if (!app.inAccessSet(credentials)) {
            return res.status(403).json({ message: 'Access Denied' });
        }

        const [username, password] = credentials.split(':');
        req.accessUser = {username, password};
        next();
    }
}

module.exports = AccessControlHandler;