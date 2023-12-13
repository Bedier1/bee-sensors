const client = require("prom-client");

// Create a Registry to register the metrics
const register = new client.Registry();

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Define a custom histogram metric for HTTP request durations
const httpRequestDurationMicroseconds = new client.Histogram({
  name: "http_request_duration_ms",
  help: "Duration of HTTP requests in ms",
  labelNames: ["method", "route", "code"],
  buckets: [0.3, 0.5, 0.7, 1, 3, 5, 7, 10, 15, 20], // Define your own buckets in seconds
});

// Register the histogram
register.registerMetric(httpRequestDurationMicroseconds);

// Reset the histogram every hour
setInterval(() => {
  httpRequestDurationMicroseconds.reset();
}, 3600000); // 3600000 milliseconds = 1 hour

// Middleware to measure response times
const metricsMiddleware = (req, res, next) => {
  const start = process.hrtime();
  res.on("finish", () => {
    const duration = process.hrtime(start);
    const durationSec = (duration[0] * 1e9 + duration[1]) / 1e9; // Convert to seconds
    httpRequestDurationMicroseconds
      .labels(req.method, req.path, res.statusCode)
      .observe(durationSec);
  });
  next();
};
module.exports = {
  metricsMiddleware,
  metricsCollector: register,
};
