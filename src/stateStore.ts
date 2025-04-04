import { SportEvent } from "./dataExtractor";

type SportEventHistorized = Omit<SportEvent, "status"> & {
  status: "REMOVED" | SportEvent["status"];
};

export class SportEventStateStore {
  #store: SportEventHistorized[] = [];

  update(data: SportEvent[]) {
    this.#store = data;
  }

  get list(): SportEvent[] {
    return this.#store as SportEvent[];
  }

  get historized() {
    return this.#store;
  }
}
