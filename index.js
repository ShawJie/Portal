const {app} = require('./src/App');
const logger = require('./src/Logger');

app.run().then((app) => {
    app.use("/", require('./src/router/ConvertStrategyRouter'));
}).catch(err => {
    logger.error(err);
});