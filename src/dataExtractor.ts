import { MappingsApiHandler, StateApiHandler } from "./apiHandlers";

type Score = {
  home: number;
  away: number;
};

type Period = "CURRENT" | `PERIOD_${number}`;

export type SportEvent = {
  id: string;
  sport: "FOOTBALL" | "BASKETBALL";
  competition: string;
  startTimeTs: number;
  homeCompetitor: string;
  awayCompetitor: string;
  status: "PRE" | "LIVE";
  scores: Map<Period, Score>;
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

  #splitScores(scoresEncoded: string): [string, Score][] {
    const scoresRegEx = /^([\w-]+@\d+:\d+\|)+[\w-]+@\d+:\d+$/;
    if (!scoresRegEx.test(scoresEncoded)) {
      console.error(`Cannot decode scores '${scoresEncoded}'`);
      throw new Error("Cannot decode scores - encoding is corrupted");
    }

    return scoresEncoded.split("|").map((scoreRecord) => {
      const [period, scores] = scoreRecord.split("@");
      const [home, away] = scores.split(":").map((s) => parseInt(s));

      return [period, { home, away }];
    });
  }

  async extract(): Promise<SportEvent[]> {
    const mappings = await this.#mappingsHandler.getData();
    const getMapping = (key: string) => {
      const mapping = mappings.get(key);
      if (mapping === undefined) {
        console.error(
          `Mapping for key '${key}' not found in mappings ${mappings}.`,
        );
        throw new Error(`Mapping for key '${key}' not found.`);
      }
      return mapping;
    };

    const odds = await this.#stateHandler.getData();
    return odds.map((sportEvent) => {
      const [
        id,
        sport,
        competition,
        startTimeTs,
        homeCompetitor,
        awayCompetitor,
        status,
        scoresEncoded,
      ] = sportEvent;

      const scoresMapped = this.#splitScores(scoresEncoded).map(
        ([periodEncoded, score]) =>
          [getMapping(periodEncoded) as Period, score] as const,
      );

      return {
        id,
        sport: getMapping(sport) as "FOOTBALL" | "BASKETBALL",
        competition: getMapping(competition),
        startTimeTs: parseInt(startTimeTs),
        homeCompetitor: getMapping(homeCompetitor),
        awayCompetitor: getMapping(awayCompetitor),
        status: getMapping(status) as "PRE" | "LIVE",
        scores: new Map(scoresMapped),
      };
    });
  }
}
