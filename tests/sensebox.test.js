jest.mock("axios");
const axios = require("axios");
const httpMocks = require("node-mocks-http");
const { senseBox } = require("../controllers/application_controller.js"); // Update this path to the actual path of your module

describe("senseBox", () => {
  it("should return the average temperature and status from multiple senseBoxes", async () => {
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

  it("should return 404 if no recent data is available", async () => {
    // ... (This test case remains unchanged)
  });

  // Add more test cases as needed to cover different scenarios
});
