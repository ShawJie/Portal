const express = require("express");

const router = express.Router();

router.get("/surfboard", require("../controller/SurfboardController"));
router.get("/singbox", require("../controller/SingboxController"));

module.exports = router;