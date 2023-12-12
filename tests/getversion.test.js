const { getVersion } = require("../controllers/application_controller.js");
const httpMocks = require("node-mocks-http");

describe("getVersion", () => {
  it("should return the version from package.json", async () => {
    const request = httpMocks.createRequest();
    const response = httpMocks.createResponse();
    const nextFunction = jest.fn();

    await getVersion(request, response, nextFunction);
    const responseData = JSON.parse(response._getData());

    expect(responseData.version).toBe("1.0.0");
  });
});
