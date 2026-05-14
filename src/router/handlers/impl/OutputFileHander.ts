import type { Request, Response } from 'express';
import BaseConverter from "../../../converter/BaseConverter";
import { RequestHandler } from "../../RequestHandlerChain";
import type { ConvertContext } from "../../../types/context";

export default class OutputFileHandler extends RequestHandler {

    private converter: BaseConverter;

    constructor(converter: BaseConverter) {
        super();
        this.converter = converter;
    }
    
    async handle(req: Request, res: Response, _next: () => Promise<void>): Promise<void> {
        const downloadContentType = {
            'Content-Type': 'application/x-download', 
            'Content-Disposition': `attachment; filename="${this.converter.getOutputName()}"`
        };
        res.writeHead(200, downloadContentType);

        const context: ConvertContext = {
            accessUser: req.accessUser,
            query: req.query as Record<string, string>,
            ua: req.get('user-agent') || ''
        };
        res.end(await this.converter.export(context));
    }
}
