const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/application_controller");

// get version route
router.get("/version", applicationController.getVersion);

router.get("/temperature", applicationController.senseBox);
router.get("/", applicationController.readyz);
module.exports = router;
