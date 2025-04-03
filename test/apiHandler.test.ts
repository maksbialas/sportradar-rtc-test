import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { MappingsApiHandler, StateApiHandler } from "../src/apiHandlers";

const stateApiParameters = {
  ApiHandler: StateApiHandler,
  responseBody: {
    odds: "a,b,c,d,e,f,g,h\ni,j,k,l,m,n,o,p\nq,r,s,t,u,v,w,x",
  },
  expectedData: [
    ["a", "b", "c", "d", "e", "f", "g", "h"],
    ["i", "j", "k", "l", "m", "n", "o", "p"],
    ["q", "r", "s", "t", "u", "v", "w", "x"],
  ] as const,
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
};

describe.each([stateApiParameters, mappingsApiParameters])(
  "$ApiHandler.name API handler",
  ({ ApiHandler, responseBody, expectedData }) => {
    beforeEach(() => {
      // mock fetch to return responseBody in a response body
      vi.spyOn(global, "fetch").mockResolvedValue(
        new Response(JSON.stringify(responseBody)),
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
  },
);

describe.each([stateApiParameters, mappingsApiParameters])(
  "Caching: $ApiHandler.name API handler",
  ({ ApiHandler, responseBody }) => {
    beforeEach(() => {
      // mock fetch to return responseBody in a response body
      vi.spyOn(global, "fetch").mockImplementation(
        async () =>
          new Response(JSON.stringify(responseBody), {
            headers: { ETag: `W/"123"` },
          }),
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
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
      await apiHandler.getData();
      expect(global.fetch).toHaveBeenNthCalledWith(3, apiHandler.apiUrl, {
        method: "HEAD",
      });
      expect(global.fetch).not.toHaveBeenNthCalledWith(4, apiHandler.apiUrl, {
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
      const nonCachedFetch = vi.spyOn(global, "fetch").mockResolvedValue(
        new Response(JSON.stringify(responseBody), {
          headers: { ETag: `W/"456"` },
        }),
      );
      await apiHandler.getData();
      expect(nonCachedFetch).toHaveBeenNthCalledWith(1, apiHandler.apiUrl, {
        method: "HEAD",
      });
      expect(nonCachedFetch).toHaveBeenNthCalledWith(2, apiHandler.apiUrl, {
        method: "GET",
      });
    });
  },
);

describe("Encoded odds", () => {
  function getDataPrepared(odds: string) {
    const stateHandler = new StateApiHandler();
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ odds })),
    );
    return stateHandler.getData();
  }

  it("should be extracted from an empty string", async () => {
    expect(await getDataPrepared("")).toEqual([]);
  });

  it("should be extracted from single line", async () => {
    const expectedData = [["1", "2", "3", "4", "5", "6", "7", "8"]];

    expect(await getDataPrepared("1,2,3,4,5,6,7,8")).toEqual(expectedData);
    expect(await getDataPrepared("1,2,3,4,5,6,7,8,")).toEqual(expectedData);
    expect(await getDataPrepared("1,2,3,4,5,6,7,8,\n")).toEqual(expectedData);
    expect(await getDataPrepared("1,2,3,4,5,6,7,8\n")).toEqual(expectedData);
  });

  it("should be extracted when no score", async () => {
    expect(await getDataPrepared("1,2,3,4,5,6,7,")).toEqual([
      ["1", "2", "3", "4", "5", "6", "7", null],
    ]);
  });

  it("should raise an error on a line with entries <7 or >8", async () => {
    await expect(
      async () => await getDataPrepared("1,2,3,4,5,6,7,8,9"),
    ).rejects.toThrowError();
    await expect(
      async () => await getDataPrepared("1,2,3,4,5,6"),
    ).rejects.toThrowError();
  });

  it("should extract multiline data", async () => {
    expect(
      await getDataPrepared(
        "1,2,3,4,5,6,7,\n1,2,3,4,5,6,7,8,\n1,2,3,4,5,6,7,8",
      ),
    ).toEqual([
      ["1", "2", "3", "4", "5", "6", "7", null],
      ["1", "2", "3", "4", "5", "6", "7", "8"],
      ["1", "2", "3", "4", "5", "6", "7", "8"],
    ]);
  });
});

describe("Encoded mappings", () => {
  function getDataPrepared(mappings: string) {
    const mappingsHandler = new MappingsApiHandler();
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ mappings })),
    );
    return mappingsHandler.getData();
  }

  it("should be extracted from an empty string", async () => {
    expect(await getDataPrepared("")).toEqual(new Map());
  });

  it("should be extracted from a line", async () => {
    const expectedData = new Map([
      ["key1", "val1"],
      ["key2", "val2"],
      ["key3", "val3"],
    ]);

    expect(await getDataPrepared("key1:val1;key2:val2;key3:val3")).toEqual(
      expectedData,
    );
    expect(await getDataPrepared("key1:val1;key2:val2;key3:val3;")).toEqual(
      expectedData,
    );
  });

  it("should raise an error on no value", async () => {
    await expect(
      async () => await getDataPrepared("key1:val1;key2;key3:val3"),
    ).rejects.toThrowError();
  });

  it("should raise an error on no key or value", async () => {
    await expect(
      async () => await getDataPrepared("key1:val1;;key3:val3"),
    ).rejects.toThrowError();
  });
});
