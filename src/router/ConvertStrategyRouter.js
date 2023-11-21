const express = require("express");
const BaseController = require("../controller/BaseController");

const SurfboardController = require("../controller/SurfboardController");
const SingboxController = require("../controller/SingboxController"); 

const router = express.Router();
const surfboardControllerInst = new SurfboardController();
const singboxControllerInst = new SingboxController();

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {BaseController} converter 
 */
const triggerDownload = async (req, res, converter) => {
    res.writeHead(200, {'Content-Type': 'application/force-download','Content-disposition':'attachment; filename=surfboard.conf'});
    res.end(await converter.export());
}

router.get("/surfboard", (req, res) => triggerDownload(req, res, surfboardControllerInst));
router.get("/singbox", (req, res) => triggerDownload(req, res, singboxControllerInst));

module.exports = router;