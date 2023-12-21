const packageJson = require("../package.json");
const axios = require("axios");
const redis = require("./redis");
const checkSenseBoxAccessibility = async (boxIds) => {
  let accessibleCount = 0;

  for (const id of boxIds) {
    try {
      await axios.get(`https://api.opensensemap.org/boxes/${id}`);
      accessibleCount++;
    } catch (error) {
      console.error(`Error accessing senseBox ID: ${id}`, error);
    }
  }

  return accessibleCount;
};

module.exports = {
  getVersion: async (req, res, next) => {
    const version = packageJson.version; // Accessing version from package.json
    res.json({ version: version });
    next();
  },

  senseBox:  async (req, res, next) => {
    
    const cacheKey = 'senseBoxData';
    const cacheExpiry =   24; // Cache for 8 minutes
  
    try {
      // Try to get data from Redis cache
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log('Using cached data');
        return res.json(JSON.parse(cachedData));
      }
  
      // Retrieve box IDs from environment variables
      const boxIds = [
        process.env.box1,
        process.env.box2,
        process.env.box3 // Add more as needed
      ].filter(Boolean); // Filter out any undefined or falsy values
  
      let totalTemperature = 0;
      let count = 0;
  
      for (const id of boxIds) {
        const response = await axios.get(`https://api.opensensemap.org/boxes/${id}`);
        const data = response.data;
  
        const temperatureSensor = data.sensors.find(
          (sensor) => sensor.title === "Temperatur"
        );
        if (temperatureSensor && temperatureSensor.lastMeasurement) {
          const measurementTime = new Date(temperatureSensor.lastMeasurement.createdAt);
          const currentTime = new Date();
  
          if (currentTime - measurementTime <= 3600000) { // 1 hour
            totalTemperature += parseFloat(temperatureSensor.lastMeasurement.value);
            count++;
          }
        }
      }
  
      if (count > 0) {
        const averageTemperature = totalTemperature / count;
        let status = "Too Cold";
        if (averageTemperature >= 10 && averageTemperature <= 36) {
          status = "Good";
        } else if (averageTemperature > 36) {
          status = "Too Hot";
        }
  
        const responseData = {
          averageTemperature: averageTemperature.toFixed(2),
          status: status,
        };
  
        // Cache the response data in Redis
        await redis.set(cacheKey, JSON.stringify(responseData), 'EX', cacheExpiry);
        await redis.set(`${cacheKey}_timestamp`, Date.now(), 'EX', cacheExpiry);


  
        res.json(responseData);
      } else {
        res.status(404).send("No recent temperature data available");
      }
    } catch (error) {
      console.error('Error in senseBox function:', error);
      res.status(500).send('Internal Server Error');
    } finally {
      next();
    }
  },

  readyz: async (req, res, next) => {
    const cacheKey = 'senseBoxData';
    const cacheAgeLimit = 300; // 5 minutes in seconds
  
    try {
      // Retrieve box IDs from environment variables
      const boxIds = [
        process.env.box1,
        process.env.box2,
        process.env.box3 // Add more as needed
      ].filter(Boolean); // Filter out any undefined or falsy values
  
      const accessibleCount = await checkSenseBoxAccessibility(boxIds);
      const requiredAccessibleCount = Math.ceil(boxIds.length / 2);
  
      // Check if enough senseBoxes are accessible
      if (accessibleCount < requiredAccessibleCount) {
        return res.status(500).send('More than 50% of the senseBoxes are not accessible.');
      }
  
      // Check the age of the cached content
      const cachedDataTimestamp = await redis.get(`${cacheKey}_timestamp`);
      if (!cachedDataTimestamp || (Date.now() - parseInt(cachedDataTimestamp, 10)) > cacheAgeLimit * 1000) {
        return res.status(500).send('Cached content is older than 5 minutes.');
      }
  
      res.status(200).send('OK');
    } catch (error) {
      console.error('Error in /readyz endpoint:', error);
      res.status(500).send('Internal Server Error');
    } finally {
      next();
    }
  }
};
