const {RequestHandler} = require("../ConvertRequestHandler");
const LoggerFactory = require("../../../Logger");

class LogRequestHandler extends RequestHandler {

    #logger = LoggerFactory.child({module: "LogRequestHandler"})

    async handle(req, res, next) {
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress   
        this.#logger.info("request info: '%s', user-agent: '%s', client address: '%s', operator: '%s'", 
            req.url, req.get('user-agent'), ip, req.accessUser?.username);
        next();
    }
}

module.exports = LogRequestHandler