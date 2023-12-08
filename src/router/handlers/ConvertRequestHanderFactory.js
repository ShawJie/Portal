const AccessControlHandler = require("./impl/AccessControlHandler");
const LogRequestHandler = require("./impl/LogRequestHandler");
const { RequestHandlerChain } = require("./ConvertRequestHandler");

class RequestHanderChainFactory {

    static #singletonAccessControl = new AccessControlHandler();
    static #singletonLogRequestHandler = new LogRequestHandler();

    static newHandlerChain() {
        return new RequestHandlerChain()
            .addHandler(RequestHanderChainFactory.#singletonAccessControl)
            .addHandler(RequestHanderChainFactory.#singletonLogRequestHandler);
    } 
}

module.exports = RequestHanderChainFactory