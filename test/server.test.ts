import { describe, expect, it } from "vitest";
import { createApi } from "../src/server";
import type { SportEvent } from "../src/dataExtractor";
import { SportEventStateStore } from "../src/stateStore";

const events: SportEvent[] = [
  {
    id: "a",
    sport: "FOOTBALL",
    competition: "La Liga",
    startTimeTs: 1234,
    homeCompetitor: "FC Barcelona",
    awayCompetitor: "Real Madrid",
    status: "PRE",
    scores: new Map(),
  },
  {
    id: "b",
    sport: "FOOTBALL",
    competition: "La Liga",
    startTimeTs: 5678,
    homeCompetitor: "Valencia CdF",
    awayCompetitor: "Atletico Madrid",
    status: "LIVE",
    scores: new Map([
      ["CURRENT", { home: 2, away: 3 }],
      ["PERIOD_1", { home: 1, away: 0 }],
    ]),
  },
];

const expectedOutput = {
  a: {
    id: "a",
    sport: "FOOTBALL",
    competition: "FOOTBALL",
    startTime: "1970-01-01T00:00:01.234Z",
    competitors: {
      HOME: {
        name: "FC Barcelona",
        type: "HOME",
      },
      AWAY: {
        name: "Real Madrid",
        type: "AWAY",
      },
    },
    status: "PRE",
    scores: {},
  },
  b: {
    id: "b",
    sport: "FOOTBALL",
    competition: "FOOTBALL",
    startTime: "1970-01-01T00:00:05.678Z",
    competitors: {
      HOME: {
        name: "Valencia CdF",
        type: "HOME",
      },
      AWAY: {
        name: "Atletico Madrid",
        type: "AWAY",
      },
    },
    status: "LIVE",
    scores: {
      CURRENT: {
        away: 3,
        home: 2,
        type: "CURRENT",
      },
      PERIOD_1: {
        away: 0,
        home: 1,
        type: "PERIOD_1",
      },
    },
  },
};

describe("Exposed API", () => {
  it("should correctly return a server object", () => {
    const store = new SportEventStateStore();
    const server = createApi(store);
    expect(server).toBeDefined();
  });

  it("should correctly transform state data into response shape", async () => {
    const store = new SportEventStateStore();
    store.update(events);
    const api = createApi(store);

    const response = await api.inject({
      method: "GET",
      url: "/client/state",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(expectedOutput);
  });
});
