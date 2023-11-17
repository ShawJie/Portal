const baseLoader = require('../common/BaseLoader');
const ini = require("ini");

const surfboardController = async (req, res) => {
    const config = await baseLoader.loadConfig();
    res.download(convertConfig2Surfboard(config));
};

const convertConfig2Surfboard = (config) => {
    return ini.encode(config);
}

module.exports = surfboardController;