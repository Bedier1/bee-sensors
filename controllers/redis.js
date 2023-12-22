const Redis = require("ioredis");
const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || "password",
 
});
// Configure as per your Redis setup
module.exports = redis;
