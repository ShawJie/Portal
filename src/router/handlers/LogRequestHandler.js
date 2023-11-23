const {RequestHandler} = require("../ConvertRequestHandler");
const LoggerFactory = require("../../Logger");

class LogRequestHandler extends RequestHandler {

    #logger = LoggerFactory.child({handler: "LogRequestHandler"})

    async handle(req, res, next) {
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress   
        this.#logger.info(`request info: '${req.url}', client address: '${ip}', user: '${req.accessUser?.username}'`);
        next();
    }
}

module.exports = LogRequestHandler