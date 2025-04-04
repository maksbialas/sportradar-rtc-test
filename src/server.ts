import Fastify from "fastify";
import type { SportEventStateStore } from "./stateStore";
import type { SportEvent } from "./dataExtractor";
import Config from "./config";

function transformResponse(state: SportEvent[]) {
  const entries = state.map((sportEvent) => ({
    id: sportEvent.id,
    status: sportEvent.status,
    scores: Object.fromEntries(
      sportEvent.scores
        .entries()
        .map(([period, score]) => [period, { type: period, ...score }]),
    ),
    startTime: new Date(sportEvent.startTimeTs).toISOString(),
    sport: sportEvent.sport,
    competitors: {
      HOME: {
        type: "HOME",
        name: sportEvent.homeCompetitor,
      },
      AWAY: {
        type: "AWAY",
        name: sportEvent.awayCompetitor,
      },
    },
    competition: sportEvent.sport,
  }));

  return Object.fromEntries(entries.map((e) => [e.id, e]));
}

export function createApi(store: SportEventStateStore) {
  const fastify = Fastify();

  fastify.get(Config.instance.apiPath, () => {
    return transformResponse(store.list);
  });

  return fastify;
}
