import { MappingsApiHandler, StateApiHandler } from "./apiHandlers";

type Score = {
  home: number;
  away: number;
};

export type SportEvent = {
  id: string;
  sport: "FOOTBALL" | "BASKETBALL";
  competition: string;
  startTimeTs: number;
  homeCompetitor: string;
  awayCompetitor: string;
  status: "PRE" | "LIVE";
  scores: Map<"CURRENT" | `PERIOD_${number}`, Score>;
};

export class SportEventDataExtractor {
  #stateHandler: StateApiHandler;
  #mappingsHandler: MappingsApiHandler;

  constructor(
    stateHandler?: StateApiHandler,
    mappingsHandler?: MappingsApiHandler,
  ) {
    this.#stateHandler = stateHandler ?? new StateApiHandler();
    this.#mappingsHandler = mappingsHandler ?? new MappingsApiHandler();
  }

  extract(): SportEvent[] {
    throw new Error("Not implemented");
  }
}
