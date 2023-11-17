const AppCore = require('./src/App');
const config = require('./config.json')

new AppCore(config).run();