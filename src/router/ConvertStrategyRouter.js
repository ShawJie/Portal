const express = require("express");

const router = express.Router();

router.get("/surfboard", require("../controller/SurfboardController"));

module.exports = router;