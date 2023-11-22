const {RequestHandler} = require("../ConvertRequestHandler");

class LogRequestHandler extends RequestHandler {
    
    async handle(req, res, next) {
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress   
        console.info(`request info: ${req.url}, client address: ${ip}`);
        next();
    }
}

module.exports = LogRequestHandler