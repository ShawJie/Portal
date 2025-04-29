import {RequestHandler} from "../../ConvertRequestHandler.js";
import LoggerFactory from "../../../Logger.js";

export default class LogRequestHandler extends RequestHandler {

    #logger = LoggerFactory.child({module: "LogRequestHandler"})

    async handle(req, res, next) {
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress   
        this.#logger.info(`Request info: '${req.url}', Client address: '${ip}', User: '${req.accessUser?.username}'`);
        next();
    }
}