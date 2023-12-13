const packageJson = require("../package.json");
const axios = require("axios");

module.exports = {
  getVersion: async (req, res, next) => {
    const version = packageJson.version; // Accessing version from package.json
    res.json({ version: version });
    next();
  },

  senseBox: async (req, res, next) => {
    let id = req.params.id;
    console.log(id);
    let ids = req.params.id.split(","); // Assuming you pass multiple IDs as a comma-separated string
    let totalTemperature = 0;
    let count = 0;

    for (const id of ids) {
      try {
        const response = await axios.get(
          `https://api.opensensemap.org/boxes/${id}`,
        );
        const data = response.data;

        // Assuming the structure of the data is similar to the provided JSON
        const temperatureSensor = data.sensors.find(
          (sensor) => sensor.title === "Temperatur",
        );
        if (temperatureSensor && temperatureSensor.lastMeasurement) {
          const measurementTime = new Date(
            temperatureSensor.lastMeasurement.createdAt,
          );
          const currentTime = new Date();

          // Check if the measurement is no older than 1 hour
          if (currentTime - measurementTime <= 3600000) {
            // 3600000 milliseconds = 1 hour
            totalTemperature += parseFloat(
              temperatureSensor.lastMeasurement.value,
            );
            count++;
          }
        }
      } catch (error) {
        console.error("Error fetching data for senseBox ID:", id, error);
        // Optionally handle the error (e.g., continue to the next ID, send an error response, etc.)
      }
    }

    if (count > 0) {
      let status;
      const averageTemperature = totalTemperature / count;
      if (averageTemperature < 10) {
        status = "Too Cold";
      } else if (averageTemperature >= 10 && averageTemperature <= 36) {
        status = "Good";
      } else {
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
