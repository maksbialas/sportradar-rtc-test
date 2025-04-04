import { describe, expect, it } from "vitest";
import { SportEvent } from "../src/dataExtractor";
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
    scores: new Map(),
  },
];

describe("Sport Event state store", () => {
  it("should correctly insert and list events", () => {
    const store = new SportEventStateStore();

    store.update(events);
    expect(store.list).toEqual(events);
  });

  it("should retain old events with a state REMOVED", () => {
    const store = new SportEventStateStore();
    const event1 = events[0];
    const event2 = events[1];

    store.update([event2]);
    store.update([event1]);

    expect(store.list).toEqual([event1]);
    expect(store.historized).toEqual([
      event1,
      { ...event2, status: "REMOVED" },
    ]);
  });
});
