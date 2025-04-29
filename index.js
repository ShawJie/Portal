import app from './src/App.js';
import logger from './src/Logger.js';
import routeHandlerMapper from './src/router/RouteHandlerMapper.js';

app.run()
    .then((appInstance) => {
        appInstance.use("/", routeHandlerMapper.initial());
    })
    .catch(err => logger.error(err));
