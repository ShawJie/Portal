const app = require('./src/App');

app.run().then((app) => {
    app.use("/", require("./src/router/ConvertStrategyRouter"));
})