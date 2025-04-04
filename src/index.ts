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

  console.log("Starting listening on port", Config.instance.apiPort);
  await server.listen({ host: "0.0.0.0", port: Config.instance.apiPort });
}

main();
