import pino from "pino";
import pretty from 'pino-pretty';

const stream = pretty({
  messageFormat: (log, messageKey) => {
    const moduleName = (log as Record<string, unknown>).module || 'Main';
    return `[${moduleName}]: ${log[messageKey]}`;
  },
  ignore: 'pid,hostname,module'
});

// @ts-expect-error pino CJS/ESM interop
const logger = (pino.default ?? pino)(stream);
export default logger;
