import pino from "pino";
import pretty from 'pino-pretty';

const stream = pretty({
  messageFormat: (log, messageKey) => {
    const moduleName = log.module || 'Main';
    return `[${moduleName}]: ${log[messageKey]}`;
  },
  ignore: 'pid,hostname,module'
});

export default pino(stream);
