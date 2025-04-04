import { describe, expect, it, vi } from "vitest";
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
    status: "PRE",
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

  it("should log on event status change", () => {
    const store = new SportEventStateStore();
    store.update(events);

    const logSpy = vi.spyOn(console, "log");

    const event1Updated: SportEvent = { ...events[0], status: "LIVE" };
    const event2Updated: SportEvent = { ...events[1], status: "LIVE" };
    store.update([event1Updated, event2Updated]);

    expect(logSpy).toBeCalledWith(
      expect.stringContaining(`Event "a" changed status: "PRE" -> "LIVE"`),
    );
    expect(logSpy).toBeCalledWith(
      expect.stringContaining(`Event "b" changed status: "PRE" -> "LIVE"`),
    );
  });

  it("should log on event score change", () => {
    const store = new SportEventStateStore();

    const event1: SportEvent = {
      ...events[0],
      status: "LIVE",
      scores: new Map([["CURRENT", { home: 2, away: 0 }]]),
    };
    const event2: SportEvent = {
      ...events[1],
      status: "LIVE",
      scores: new Map([["CURRENT", { home: 1, away: 1 }]]),
    };
    store.update([event1, event2]);

    const logSpy = vi.spyOn(console, "log");

    event1.scores.set("CURRENT", { home: 3, away: 0 });
    event2.scores.set("CURRENT", { home: 1, away: 2 });
    store.update([event1, event2]);

    expect(logSpy).toBeCalledWith(
      expect.stringContaining(`Score of "a" changed: 2:0 -> 3:0`),
    );
    expect(logSpy).toBeCalledWith(
      expect.stringContaining(`Score of "b" changed: 1:1 -> 1:2`),
    );
  });
});
