import AccessControlHandler from "./handlers/impl/AccessControlHandler";
import LogRequestHandler from "./handlers/impl/LogRequestHandler";
import { RequestHandlerChain } from "./ConvertRequestHandler";

export default class RequestHanderChainFactory {

    static #singletonAccessControl = new AccessControlHandler();
    static #singletonLogRequestHandler = new LogRequestHandler();

    static newHandlerChain(): RequestHandlerChain {
        return new RequestHandlerChain()
            .addHandler(RequestHanderChainFactory.#singletonAccessControl)
            .addHandler(RequestHanderChainFactory.#singletonLogRequestHandler);
    } 
}
