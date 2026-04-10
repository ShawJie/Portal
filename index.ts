import app from './src/App';
import logger from './src/Logger';
import routeHandlerMapper from './src/router/RouteHandlerMapper';

app.run()
    .then((appInstance) => {
        appInstance.use("/", routeHandlerMapper.initial());
    })
    .catch(err => logger.error(err));
