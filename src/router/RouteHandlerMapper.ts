import RequestHandlerChainFactory from "./RequestHandlerChainFactory";
import OutputFileHandler from "./handlers/impl/OutputFileHander";
import BaseConverter from "../converter/BaseConverter";

import express, { type Router, type Request, type Response } from "express";
import LoggerFactory from "../Logger";

import ClashConverter from "../converter/ClashConverter";
import SurfboardConverter from "../converter/SurfboardConverter";
import AdminRouter from "./AdminRouter";
import { RequestHandler, RequestHandlerChain } from "./RequestHandlerChain";

type HttpMethod = 'get' | 'post' | 'put' | 'delete';

class RouteHandlerMapper {

    private logger = LoggerFactory.child({module: "HandlerMapper"});
    private router!: Router;

    private registryConverterHandler(path: string, handler: BaseConverter): void {
        const processHandlerChain = RequestHandlerChainFactory.newConverterChain()
            .addHandler(new OutputFileHandler(handler));
        this.logger.info('Registry converter handler for path \'%s\'', path);

        this.observerRouter(path, processHandlerChain);
    }

    private registryAdminHandler(path: string, method: HttpMethod, handler: RequestHandler): void {
        const processHandlerChain = RequestHandlerChainFactory.newAdminChain()
            .addHandler(handler);
        this.logger.info('Registry admin handler for path \'%s\' [%s]', path, method.toUpperCase());

        this.observerRouter(path, processHandlerChain, method);
    }

    private observerRouter(path: string, chain: RequestHandlerChain, method: HttpMethod = 'get'): void {
        this.router[method](path, (req: Request, res: Response) => chain.handle(req, res));
    }

    initial(): Router {
        this.router = express.Router();

        new AdminRouter().getRoutes().forEach(({ path, method, handler }) => {
            this.registryAdminHandler(path, method, handler);
        });

        this.registryConverterHandler("/clash", new ClashConverter());
        this.registryConverterHandler("/surfboard", new SurfboardConverter());
        return this.router;
    }
}

export default new RouteHandlerMapper();
