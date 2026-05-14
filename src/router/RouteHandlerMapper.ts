import RequestHanderChainFactory from "./ConvertRequestHanderFactory";
import OutputFileHandler from "./handlers/impl/OutputFileHander";
import BaseConverter from "../converter/BaseConverter";

import express, { type Router, type Request, type Response } from "express";
import LoggerFactory from "../Logger";

import ClashConverter from "../converter/ClashConverter";
import SurfboardConverter from "../converter/SurfboardConverter";
import { RequestHandlerChain } from "./ConvertRequestHandler";

class RouteHandlerMapper {

    private handlers: Map<string, RequestHandlerChain> = new Map();
    private logger = LoggerFactory.child({module: "HandlerMapper"});
    private router!: Router;

    private registryHandler(path: string, handler: BaseConverter): void {
        const processHandlerChain = RequestHanderChainFactory.newHandlerChain()
            .addHandler(new OutputFileHandler(handler));
        this.logger.info('Registry handler for path \'%s\'', path);
        this.handlers.set(path, processHandlerChain);

        this.observerRouter(path, processHandlerChain);
    }

    private observerRouter(path: string, chain: RequestHandlerChain): void {
        this.router.get(path, (req: Request, res: Response) => chain.handle(req, res));
    }

    private resources(): void {
        this.router.get("/", (_req: Request, res: Response) => {
            const resources: {path: string; method: string}[] = [];
            for (const [key] of this.handlers) {
                resources.push({
                    path: key,
                    method: "GET"
                });
            }

            res.json(resources);
            res.end();
        });
    }

    initial(): Router {
        this.router = express.Router();

        this.registryHandler("/clash", new ClashConverter());
        this.registryHandler("/surfboard", new SurfboardConverter());
        this.resources();
        return this.router;
    }
}

export default new RouteHandlerMapper();
