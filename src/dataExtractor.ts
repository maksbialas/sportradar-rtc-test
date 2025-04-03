import { MappingsApiHandler, StateApiHandler } from "./apiHandlers";

type Score = {
  home: number;
  away: number;
};

type Period = "CURRENT" | `PERIOD_${number}`;

class NoMappingError extends Error {
  key: string;

  constructor(key: string) {
    super(`Mapping for key '${key}' not found.`);
    this.key = key;
  }
}

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
    return scoresEncoded.split("|").map((scoreRecord) => {
      const [period, scores] = scoreRecord.split("@");
      const [home, away] = scores.split(":").map((s) => parseInt(s));

      return [period, { home, away }];
    });
  }

  async extract(): Promise<SportEvent[]> {
    function getMapping(key: string) {
      const mapping = mappings.get(key);
      if (mapping === undefined) throw new NoMappingError(key);

      return mapping;
    }

    const mappings = await this.#mappingsHandler.getData();
    const odds = await this.#stateHandler.getData();
    const sportEvents: SportEvent[] = [];

    for (const sportEvent of odds) {
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

      try {
        let scoresMapped: [Period, Score][];
        if (scoresEncoded === null) {
          scoresMapped = [];
        } else {
          scoresMapped = this.#splitScores(scoresEncoded).map(
            ([periodEncoded, score]) => [
              getMapping(periodEncoded) as Period,
              score,
            ],
          );
        }
        sportEvents.push({
          id,
          sport: getMapping(sport) as "FOOTBALL" | "BASKETBALL",
          competition: getMapping(competition),
          startTimeTs: parseInt(startTimeTs),
          homeCompetitor: getMapping(homeCompetitor),
          awayCompetitor: getMapping(awayCompetitor),
          status: getMapping(status) as "PRE" | "LIVE",
          scores: new Map(scoresMapped),
        });
      } catch (e) {
        if (e instanceof NoMappingError) {
          console.error(
            `Mapping for key '${e.key}' required in ${JSON.stringify(sportEvent)},`,
            `not found in mappings { ${[...mappings.entries().map(([k, v]) => `${k} => ${v}`)].join(", ")} }.`,
          );
        } else {
          throw e; // if not a NoMappingError, propagate
        }
      }
    }
    return sportEvents;
  }
}
