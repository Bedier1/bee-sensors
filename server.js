const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const port = process.env.PORT || 3000;
const {
  metricsMiddleware,
  metricsCollector,
} = require("./middleware/metricsMiddleware");

// Import package.json
const application_routes = require("./routes/application_routes");
const metricsRoute = require("./routes/promethues_routes.js");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(metricsMiddleware);

app.use("/api/", application_routes);
app.use("/metrics", metricsRoute);
app.use("/readyz",application_routes)

// Version endpoint

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
