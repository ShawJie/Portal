const LogRequestHandler = require("./handlers/LogRequestHandler");
const { RequestHandlerChain } = require("./ConvertRequestHandler");

class RequestHanderChainFactory {

    static newHandlerChain() {
        return new RequestHandlerChain()
            .addHandler(new LogRequestHandler());
    } 
}

module.exports = RequestHanderChainFactory