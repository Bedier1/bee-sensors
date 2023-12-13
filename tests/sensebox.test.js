jest.mock("axios");
const axios = require("axios");
const httpMocks = require("node-mocks-http");
const { senseBox } = require("../controllers/application_controller.js");

describe("senseBox", () => {
  // Set up mock environment variables before each test
  beforeEach(() => {
    process.env.box1 = "5eba5fbad46fb8001b799786";
    process.env.box2 = "5eba5fbad46fb8001b799787";
    // Add more mock box IDs as needed
  });

  it("should return the average temperature and status from multiple senseBoxes", async () => {
    const mockRequest = httpMocks.createRequest();
    const mockResponse = httpMocks.createResponse();
    const nextFunction = jest.fn();

    // Mocking Axios responses for each senseBox
    axios.get.mockImplementation((url) => {
      if (url.includes(process.env.box1)) {
        return Promise.resolve({
          data: {
            sensors: [
              {
                title: "Temperatur",
                lastMeasurement: {
                  createdAt: new Date().toISOString(),
                  value: "20",
                },
              },
            ],
          },
        });
      } else if (url.includes(process.env.box2)) {
        return Promise.resolve({
          data: {
            sensors: [
              {
                title: "Temperatur",
                lastMeasurement: {
                  createdAt: new Date().toISOString(),
                  value: "22",
                },
              },
            ],
          },
        });
      }
    });

    await senseBox(mockRequest, mockResponse, nextFunction);

    const responseData = JSON.parse(mockResponse._getData());
    expect(responseData).toHaveProperty("averageTemperature");
    expect(responseData).toHaveProperty("status");
    expect(responseData.averageTemperature).toBe("21.00");
    expect(responseData.status).toBe("Good");
  });
});
