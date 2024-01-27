const RequestHanderChainFactory = require("./handlers/ConvertRequestHanderFactory");
const OutputFileHandler = require("./handlers/impl/OutputFileHander");
const BaseConverter = require("../converter/BaseConverter");

const express = require("express");
const LoggerFactory = require("../Logger");

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

        this.#registryHandler("/clash", require("../converter/ClashConverter"));
        this.#registryHandler("/surfboard", require("../converter/SurfboardConverter"));
        this.#registryHandler("/singbox", require("../converter/SingboxConverter"));

        this.#resources();
        return this.#router;
    }
}

module.exports = new RouteHandlerMapper();