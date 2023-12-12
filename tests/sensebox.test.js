jest.mock("axios");
const axios = require("axios");
const httpMocks = require("node-mocks-http");
const { senseBox } = require("../controllers/application_controller.js"); // Update this path to the actual path of your module

describe("senseBox", () => {
  it("should return the average temperature from multiple senseBoxes", async () => {
    const mockRequest = httpMocks.createRequest({
      params: {
        id: "5eba5fbad46fb8001b799786,5eba5fbad46fb8001b799787", // Example senseBox IDs
      },
    });
    const mockResponse = httpMocks.createResponse();
    const nextFunction = jest.fn();

    // Mocking Axios responses for each senseBox
    axios.get.mockImplementation((url) => {
      if (url.includes("5eba5fbad46fb8001b799786")) {
        return Promise.resolve({
          data: {
            // Mock response structure for the first senseBox
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
      } else if (url.includes("5eba5fbad46fb8001b799787")) {
        return Promise.resolve({
          data: {
            // Mock response structure for the second senseBox
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
    expect(responseData.averageTemperature).toBe("21.00"); // The expected average of 20 and 22
  });

  it("should return 404 if no recent data is available", async () => {
    const mockRequest = httpMocks.createRequest({
      params: {
        id: "5eba5fbad46fb8001b799786", // Example senseBox ID
      },
    });
    const mockResponse = httpMocks.createResponse();
    const nextFunction = jest.fn();

    // Mocking Axios response with outdated data
    axios.get.mockResolvedValue({
      data: {
        sensors: [
          {
            title: "Temperatur",
            lastMeasurement: {
              createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
              value: "20",
            },
          },
        ],
      },
    });

    await senseBox(mockRequest, mockResponse, nextFunction);

    expect(mockResponse.statusCode).toBe(404);
    expect(mockResponse._getData()).toBe(
      "No recent temperature data available",
    );
  });

  // Add more test cases as needed to cover different scenarios
});
