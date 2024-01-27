const app = require('./src/App');
const logger = require('./src/Logger');
const routeHandlerMapper = require('./src/router/RouteHandlerMapper');

app.run().then((app) => {
    app.use("/", routeHandlerMapper.initial());
}).catch(err => {
    logger.error(err);
});