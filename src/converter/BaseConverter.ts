import type { ConvertContext } from '../types/context';

export default class BaseConverter {
    
    private outputName: string;

    constructor(outputName: string) {
        this.outputName = outputName;
    }

    getOutputName(): string {
        return this.outputName;
    }

    async export(_context: ConvertContext): Promise<string> {
        throw new Error('You have to implement the method doSomething!');
    }

    protected _clone<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }

    protected _kebabize(str: string): string {
        return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }

    protected _underlinize(str: string): string {
        return str.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
    }
}
