import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SportEvent, SportEventDataExtractor } from "../src/dataExtractor";
import { MappingsApiHandler, StateApiHandler } from "../src/apiHandlers";

const mockStateHandler: StateApiHandler = new StateApiHandler();
const mockMappingsHandler: MappingsApiHandler = new MappingsApiHandler();

describe("Sport Event data extractor", () => {
  beforeEach(() => {
    vi.spyOn(mockMappingsHandler, "getData").mockResolvedValue(
      new Map([
        ["a", "id"],
        ["b", "FOOTBALL"],
        ["c", "La Liga"],
        ["e", "FC Barcelona"],
        ["f", "Real Madrid"],
        ["g", "PRE"],
        ["h", "CURRENT"],
        ["i", "PERIOD_1"],
      ]),
    );
    vi.spyOn(mockStateHandler, "getData").mockResolvedValue([
      ["a", "b", "c", "1234", "e", "f", "g", "h@5:1|i@3:0"],
    ]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should correctly compose data from odds and mappings", async () => {
    const extractor = new SportEventDataExtractor(
      mockStateHandler,
      mockMappingsHandler,
    );

    const desiredOutput: SportEvent[] = [
      {
        id: "a",
        sport: "FOOTBALL",
        competition: "La Liga",
        startTimeTs: 1234,
        homeCompetitor: "FC Barcelona",
        awayCompetitor: "Real Madrid",
        status: "PRE",
        scores: new Map([
          ["CURRENT", { home: 5, away: 1 }],
          ["PERIOD_1", { home: 3, away: 0 }],
        ]),
      },
    ];

    expect(await extractor.extract()).toEqual(desiredOutput);
  });

  it("should throw an error when a key is not present in mappings", async () => {
    // mappings are empty
    vi.spyOn(mockMappingsHandler, "getData").mockResolvedValue(new Map([]));

    const extractor = new SportEventDataExtractor(
      mockStateHandler,
      mockMappingsHandler,
    );

    await expect(() => extractor.extract()).rejects.toThrowError();
  });

  it("should throw an error when score encoding is malformed", async () => {
    // mappings are empty
    vi.spyOn(mockStateHandler, "getData").mockResolvedValue([
      ["a", "b", "c", "1234", "e", "f", "g", "h@1||3:0"],
    ]);

    const extractor = new SportEventDataExtractor(
      mockStateHandler,
      mockMappingsHandler,
    );

    await expect(() => extractor.extract()).rejects.toThrowError();
  });

  it("assigns default handlers when no handlers are passed in constructor", async () => {
    const extractor = new SportEventDataExtractor();
    expect(extractor).toBeDefined();
  });
});
