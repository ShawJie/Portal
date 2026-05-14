import AccessControlHandler from "./handlers/impl/AccessControlHandler";
import SessionAuthHandler from "./handlers/impl/SessionAuthHandler";
import LogRequestHandler from "./handlers/impl/LogRequestHandler";
import { RequestHandlerChain } from "./RequestHandlerChain";

export default class RequestHandlerChainFactory {

    static #singletonAccessControl = new AccessControlHandler();
    static #singletonSessionAuth = new SessionAuthHandler();
    static #singletonLogRequestHandler = new LogRequestHandler();

    static newConverterChain(): RequestHandlerChain {
        return new RequestHandlerChain()
            .addHandler(RequestHandlerChainFactory.#singletonAccessControl)
            .addHandler(RequestHandlerChainFactory.#singletonLogRequestHandler);
    }

    static newAdminChain(): RequestHandlerChain {
        return new RequestHandlerChain()
            .addHandler(RequestHandlerChainFactory.#singletonSessionAuth)
            .addHandler(RequestHandlerChainFactory.#singletonLogRequestHandler);
    }
}
