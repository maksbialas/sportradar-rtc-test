import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import {
  MappingsApiHandler,
  StateApiHandler,
  Tuple8,
} from "../src/apiHandlers";
import type { MappingsAPIResponse, StateAPIResponse } from "../src/apiHandlers";

const mockStateResponse: StateAPIResponse = {
  odds: "a,b,c,d,e,f,g,h,\ni,j,k,l,m,n,o,p,\nq,r,s,t,u,v,w,x",
};
const expectedState: Tuple8[] = [
  ["a", "b", "c", "d", "e", "f", "g", "h"],
  ["i", "j", "k", "l", "m", "n", "o", "p"],
  ["q", "r", "s", "t", "u", "v", "w", "x"],
];

const mockMappingsResponse: MappingsAPIResponse = {
  mappings: "id1:value1;id2:value2;idN:valueN",
};
const expectedMappings: Map<string, string> = new Map([
  ["id1", "value1"],
  ["id2", "value2"],
  ["idN", "valueN"],
]);

describe.each([
  {
    apiHandler: new StateApiHandler(),
    responseBody: mockStateResponse,
    expectedData: expectedState,
  },
  {
    apiHandler: new MappingsApiHandler(),
    responseBody: mockMappingsResponse,
    expectedData: expectedMappings,
  },
])(
  "$apiHandler.constructor.name API handler",
  ({ apiHandler, responseBody, expectedData }) => {
    beforeEach(() => {
      // mock fetch to return responseBody in a response body
      vi.spyOn(global, "fetch").mockResolvedValue(
        new Response(JSON.stringify(responseBody)),
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should call proper API url", async () => {
      await apiHandler.getData();
      expect(global.fetch).toHaveBeenCalledWith(apiHandler.apiUrl);
    });

    it("should fetch current state", async () => {
      const response = await apiHandler.getData();
      expect(response).toEqual(expectedData);
    });
  },
);
