const express = require("express");
const BaseController = require("../controller/BaseController");

const surfboardController = require("../controller/SurfboardController");
const singboxController = require("../controller/SingboxController"); 
const clashController = require("../controller/ClashController");

const router = express.Router();

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {BaseController} converter 
 */
const triggerDownload = async (req, res, converter) => {
    const downloadContentType = {'Content-Type': `application/force-download','Content-disposition':'attachment; filename=${converter.outputName}`};
    res.writeHead(200, downloadContentType);
    res.end(await converter.export());
}

router.get("/surfboard", (req, res) => triggerDownload(req, res, surfboardController));
router.get("/singbox", (req, res) => triggerDownload(req, res, singboxController));
router.get("/clash", (req, res) => triggerDownload(req, res, clashController));

module.exports = router;