const BaseConverter = require("../../../converter/BaseConverter");
const { RequestHandler } = require("../ConvertRequestHandler");

class OutputFileHandler extends RequestHandler {

    /**
     * 
     * @param {BaseConverter} converter 
     */
    constructor(converter) {
        super();
        this.converter = converter;
    }
    
    async handle(req, res, next) {
        const downloadContentType = {
            'Content-Type': 'application/x-downloa', 
            'Content-disposition': `attachment;filename=${this.converter.getOutputName()}`
        };
        res.writeHead(200, downloadContentType);

        const context = {
            accessUser: req.accessUser,
            query: req.query,
            ua: req.get('user-agent')
        }
        res.end(await this.converter.export(context));
    }
}

module.exports = OutputFileHandler