import { SportEventStateStore } from "./stateStore";
import { SportEventDataExtractor } from "./dataExtractor";
import { createApi } from "./server";
import Config from "./config";

export async function main() {
  const store = new SportEventStateStore();
  const extractor = new SportEventDataExtractor();
  const server = createApi(store);

  setInterval(async () => {
    try {
      store.update(await extractor.extract());
    } catch (e) {
      console.error(e);
    }
  }, 1000);

  await server.listen({ port: Config.instance.apiPort });
}

main();
