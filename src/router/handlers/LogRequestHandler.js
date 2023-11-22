const {RequestHandler} = require("../ConvertRequestHandler");
const logger = require("../../Logger");

class LogRequestHandler extends RequestHandler {
    
    async handle(req, res, next) {
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress   
        logger.info(`request info: ${req.url}, client address: ${ip}`);
        next();
    }
}

module.exports = LogRequestHandler