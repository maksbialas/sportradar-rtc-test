import Fastify from "fastify";
import type { SportEventStateStore } from "./stateStore";

export function createApi(store: SportEventStateStore) {
  const fastify = Fastify();

  fastify.get("/client/state", () => {
    return {};
  });

  return fastify;
}
