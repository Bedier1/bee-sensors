const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/application_controller");

// get version route
router.get("/version", applicationController.getVersion);

router.get("/temperature/:id", applicationController.senseBox);

module.exports = router;
