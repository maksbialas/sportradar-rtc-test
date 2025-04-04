import { SportEvent } from "./dataExtractor";

type SportEventHistorized = Omit<SportEvent, "status"> & {
  status: "REMOVED" | SportEvent["status"];
};

export class SportEventStateStore {
  #store: SportEventHistorized[] = [];

  update(data: SportEvent[]) {
    const newIds = new Set(data.map((event) => event.id));
    const removed: SportEventHistorized[] = this.#store
      .filter((event) => !newIds.has(event.id))
      .map((event) => ({ ...event, status: "REMOVED" }));
    this.#store = [...data, ...removed];
  }

  get list(): SportEvent[] {
    return this.#store.filter((e) => e.status !== "REMOVED") as SportEvent[];
  }

  get historized() {
    return this.#store;
  }
}
