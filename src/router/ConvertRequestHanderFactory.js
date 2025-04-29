import AccessControlHandler from "./handlers/impl/AccessControlHandler.js";
import LogRequestHandler from "./handlers/impl/LogRequestHandler.js";
import { RequestHandlerChain } from "./ConvertRequestHandler.js";

export default class RequestHanderChainFactory {

    static #singletonAccessControl = new AccessControlHandler();
    static #singletonLogRequestHandler = new LogRequestHandler();

    static newHandlerChain() {
        return new RequestHandlerChain()
            .addHandler(RequestHanderChainFactory.#singletonAccessControl)
            .addHandler(RequestHanderChainFactory.#singletonLogRequestHandler);
    } 
}