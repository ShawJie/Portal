const axios = require('axios');
const ini = require("ini");

const baseLoader = (function() {
    const surfboardPath = "https://ninjasub.com/link/mXp6ZDSijcNCAHoc?surfboard=1";

    function loadConfig() {
        return new Promise((resolve, reject) => {
            axios.get(surfboardPath).then((res) => {
                resolve(ini.parse(res.data));
            }).catch((err) => {
                console.error('load surfboard base config failed');
                reject(err);
            });
        })
    }

    return {
        loadConfig
    }
})();

module.exports = baseLoader;