import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { MappingsApiHandler, StateApiHandler } from "../src/apiHandlers";

const stateApiParameters = {
  ApiHandler: StateApiHandler,
  responseBody: {
    odds: "a,b,c,d,e,f,g,h,\ni,j,k,l,m,n,o,p,\nq,r,s,t,u,v,w,x,",
  },
  expectedData: [
    ["a", "b", "c", "d", "e", "f", "g", "h"],
    ["i", "j", "k", "l", "m", "n", "o", "p"],
    ["q", "r", "s", "t", "u", "v", "w", "x"],
  ] as const,
  nonDecodableBody: { odds: "a,b,c,d\ne,f,g,h" },
};

const mappingsApiParameters = {
  ApiHandler: MappingsApiHandler,
  responseBody: {
    mappings: "id1:value1;id2:value2;idN:valueN",
  },
  expectedData: new Map([
    ["id1", "value1"],
    ["id2", "value2"],
    ["idN", "valueN"],
  ]),
  nonDecodableBody: {
    mappings: "id1;id2:value2;id3",
  },
};

describe.each([stateApiParameters, mappingsApiParameters])(
  "$ApiHandler.name API handler",
  ({ ApiHandler, responseBody, expectedData, nonDecodableBody }) => {
    beforeEach(() => {
      // mock fetch to return responseBody in a response body
      vi.spyOn(global, "fetch").mockResolvedValue(
        new Response(JSON.stringify(responseBody), {
          headers: { ETag: `W/"123"` },
        }),
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should call proper API url with GET request", async () => {
      const apiHandler = new ApiHandler();
      await apiHandler.getData();
      expect(global.fetch).toHaveBeenCalledWith(apiHandler.apiUrl, {
        method: "GET",
      });
    });

    it("should fetch current state", async () => {
      const apiHandler = new ApiHandler();
      const response = await apiHandler.getData();
      expect(response).toEqual(expectedData);
    });

    it("should throw errror if data not found in response", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ something: "different" })),
      );
      const apiHandler = new ApiHandler();
      await expect(() => apiHandler.getData()).rejects.toThrowError();
    });

    it("should throw errror if response data is not decodable", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(
        new Response(JSON.stringify(nonDecodableBody)),
      );
      const apiHandler = new ApiHandler();
      await expect(() => apiHandler.getData()).rejects.toThrowError();
    });

    it("should call API url with HEAD request for caching", async () => {
      const apiHandler = new ApiHandler();
      await apiHandler.getData();
      expect(global.fetch).toHaveBeenCalledWith(apiHandler.apiUrl, {
        method: "HEAD",
      });
    });

    it("should call API url with only 1 GET request when ETag is the same", async () => {
      const apiHandler = new ApiHandler();

      // 1st fetching
      await apiHandler.getData();
      expect(global.fetch).toHaveBeenNthCalledWith(1, apiHandler.apiUrl, {
        method: "HEAD",
      });
      expect(global.fetch).toHaveBeenNthCalledWith(2, apiHandler.apiUrl, {
        method: "GET",
      });

      // 2nd fetching
      vi.spyOn(global, "fetch").mockResolvedValue(
        new Response(JSON.stringify(responseBody), {
          headers: { ETag: `W/"123"` },
        }),
      );
      await apiHandler.getData();
      expect(global.fetch).toHaveBeenNthCalledWith(1, apiHandler.apiUrl, {
        method: "HEAD",
      });
      expect(global.fetch).not.toHaveBeenNthCalledWith(2, apiHandler.apiUrl, {
        method: "GET",
      });
    });

    it("should call API url with new GET request when ETag has changed", async () => {
      const apiHandler = new ApiHandler();

      // 1st fetching
      await apiHandler.getData();
      expect(global.fetch).toHaveBeenNthCalledWith(1, apiHandler.apiUrl, {
        method: "HEAD",
      });
      expect(global.fetch).toHaveBeenNthCalledWith(2, apiHandler.apiUrl, {
        method: "GET",
      });

      // 2nd fetching
      vi.spyOn(global, "fetch").mockResolvedValue(
        new Response(JSON.stringify(responseBody), {
          headers: { ETag: `W/"456"` },
        }),
      );
      await apiHandler.getData();
      expect(global.fetch).toHaveBeenNthCalledWith(1, apiHandler.apiUrl, {
        method: "HEAD",
      });
      expect(global.fetch).toHaveBeenNthCalledWith(2, apiHandler.apiUrl, {
        method: "GET",
      });
    });
  },
);
