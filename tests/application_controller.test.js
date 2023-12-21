// Importing necessary modules
const axios = require('axios');
const redis = require('../controllers/redis.js');
const myModule = require('../controllers/application_controller.js'); // Replace with the actual path of your module

// Mocking axios and redis
jest.mock('axios');
jest.mock('../controllers/redis.js', () => {
  return {
    get: jest.fn(),
    set: jest.fn(),
    quit: jest.fn(),
  };
});

// Setting up environment variables
process.env.box1 = '5eba5fbad46fb8001b799786';
process.env.box2 = '5e60cf5557703e001bdae7f8';
process.env.box3 = '5eb99cacd46fb8001b2ce04c';

describe('Your Module Tests', () => {
  // This will run after each test to close the Redis connection
  afterEach(async () => {
    await redis.quit();
  });

  // Test for getVersion
  describe('getVersion', () => {
    it('should return the correct version from package.json', async () => {
      const req = {};
      const res = { json: jest.fn() };
      const next = jest.fn();

      await myModule.getVersion(req, res, next);

      const expectedVersion = require('../package.json').version;
      expect(res.json).toHaveBeenCalledWith({ version: expectedVersion });
    });
  });

  // Test for checkSenseBoxAccessibility

  // Test for senseBox
  describe('senseBox', () => {
    it('should successfully retrieve and cache data', async () => {
      redis.get.mockResolvedValue(null);
      axios.get.mockResolvedValue({
        data: {
          sensors: [
            { title: "Temperatur", lastMeasurement: { createdAt: new Date().toISOString(), value: "20" } }
          ]
        }
      });

      const req = {};
      const res = { json: jest.fn() };
      const next = jest.fn();

      await myModule.senseBox(req, res, next);

      expect(redis.set).toHaveBeenCalledTimes(2); // Expecting two calls for caching data and timestamp
      expect(res.json).toHaveBeenCalled();
    });
  });

  // Test for readyz
  describe('readyz', () => {
    it('should return 200 OK when conditions are met', async () => {
      redis.get.mockResolvedValue(Date.now().toString());
      axios.get.mockResolvedValue({});

      const req = {};
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const next = jest.fn();

      await myModule.readyz(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith('OK');
    });
  });
});
