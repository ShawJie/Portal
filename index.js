const baseLoader = require('./common/BaseLoader');
const express = require("express");
const app = express();

baseLoader.loadConfig().then((config) => {
    console.log(config);
    const server = app.listen(8080, () => {
        let {address, port} = server.address();
        console.log(`service started, domain: http://${address}:${port}`);
    }); 

    app.get('/', (req, res) => {
        res.set
        res.send('Hello world!');
    });
});