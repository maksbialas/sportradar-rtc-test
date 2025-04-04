import { SportEventStateStore } from "./stateStore";
import { SportEventDataExtractor } from "./dataExtractor";
import { createApi } from "./server";
import Config from "./config";

export async function main() {
  const store = new SportEventStateStore();
  const extractor = new SportEventDataExtractor();
  const server = createApi(store);

  setInterval(async () => {
    store.update(await extractor.extract());
  }, 1000);

  await server.listen({ port: Config.instance.apiPort });
}

main();
