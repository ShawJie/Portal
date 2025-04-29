import RequestHanderChainFactory from "./handlers/ConvertRequestHanderFactory.js";
import OutputFileHandler from "./handlers/impl/OutputFileHander.js";
import BaseConverter from "../converter/BaseConverter.js";

import express from "express";
import LoggerFactory from "../Logger.js";

import ClashConverter from "../converter/ClashConverter.js";
import SurfboardConverter from "../converter/SurfboardConverter.js";
import SingboxConverter from "../converter/SingboxConverter.js";

class RouteHandlerMapper {

    #handlers = new Map();
    #logger = LoggerFactory.child({module: "HandlerMapper"});
    #router;

    /**
     * 
     * @param {String} path 
     * @param {BaseConverter} handler 
     */
    #registryHandler(path, handler) {
        const processHandlerChain = RequestHanderChainFactory.newHandlerChain()
            .addHandler(new OutputFileHandler(handler));
        this.#logger.info('Registry handler for path \'%s\'', path);
        this.#handlers.set(path, processHandlerChain);

        this.#observerRouter(path, processHandlerChain);
    }

    #observerRouter(path, chain) {
        this.#router.get(path, (req, res) => chain.handle(req, res));
    }

    #resources() {
        this.#router.get("/", (req, res) => {
            const resources = [];
            for (const [key, val] of this.#handlers) {
                resources.push({
                    path: key,
                    method: "GET"
                });
            }

            res.json(resources);
            res.end();
        });
    }

    initial() {
        this.#router = express.Router();

        this.#registryHandler("/clash", new ClashConverter());
        this.#registryHandler("/surfboard", new SurfboardConverter());
        this.#registryHandler("/singbox", new SingboxConverter());

        this.#resources();
        return this.#router;
    }
}

export default new RouteHandlerMapper();
