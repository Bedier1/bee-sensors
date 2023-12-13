const packageJson = require("../package.json");
const axios = require("axios");

module.exports = {
  getVersion: async (req, res, next) => {
    const version = packageJson.version; // Accessing version from package.json
    res.json({ version: version });
    next();
  },

  senseBox: async (req, res, next) => {
    // Retrieve box IDs from environment variables
    const boxIds = [
      process.env.box1,
      process.env.box2,
      process.env.box3, // Add more as needed
    ].filter(Boolean); // Filter out any undefined or falsy values

    let totalTemperature = 0;
    let count = 0;

    for (const id of boxIds) {
      try {
        const response = await axios.get(
          `https://api.opensensemap.org/boxes/${id}`,
        );
        const data = response.data;

        const temperatureSensor = data.sensors.find(
          (sensor) => sensor.title === "Temperatur",
        );
        if (temperatureSensor && temperatureSensor.lastMeasurement) {
          const measurementTime = new Date(
            temperatureSensor.lastMeasurement.createdAt,
          );
          const currentTime = new Date();

          if (currentTime - measurementTime <= 3600000) {
            // 1 hour
            totalTemperature += parseFloat(
              temperatureSensor.lastMeasurement.value,
            );
            count++;
          }
        }
      } catch (error) {
        console.error("Error fetching data for senseBox ID:", id, error);
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

      res.json({
        averageTemperature: averageTemperature.toFixed(2),
        status: status,
      });
    } else {
      res.status(404).send("No recent temperature data available");
    }

    next();
  },
};
