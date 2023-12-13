const express = require("express");
const router = express.Router();
const { metricsCollector } = require("../middleware/metricsMiddleware");

router.get("/", async (req, res) => {
  try {
    res.set("Content-Type", metricsCollector.contentType);
    res.end(await metricsCollector.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

module.exports = router;
