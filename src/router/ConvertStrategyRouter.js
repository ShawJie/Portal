const express = require("express");
const RequestHanderChainFactory = require("./ConvertRequestHanderFactory");
const OutputFileHandler = require("./handlers/OutputFileHander");

const handlers = {
    "/surfboard": RequestHanderChainFactory.newHandlerChain()
        .addHandler(new OutputFileHandler(require("../converter/SurfboardConverter"))),
    "/singbox": RequestHanderChainFactory.newHandlerChain()
        .addHandler(new OutputFileHandler(require("../converter/SingboxConverter"))),
    "/clash": RequestHanderChainFactory.newHandlerChain()
        .addHandler(new OutputFileHandler(require("../converter/ClashConverter"))),
}

const router = express.Router();

for (const path in handlers) {
    const handlerChain = handlers[path];
    router.get(path, (req, res) => handlerChain.handle(req, res));
}

module.exports = router;