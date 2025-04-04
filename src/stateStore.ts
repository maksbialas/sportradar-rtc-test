import { SportEvent } from "./dataExtractor";

type SportEventHistorized = Omit<SportEvent, "status"> & {
  status: "REMOVED" | SportEvent["status"];
};

export class SportEventStateStore {
  #store: SportEventHistorized[] = [];

  update(data: SportEvent[]) {
    const newEvents = new Map(data.map((event) => [event.id, event]));

    const removed: SportEventHistorized[] = this.#store
      .filter((event) => !newEvents.has(event.id))
      .map((event) => ({ ...event, status: "REMOVED" }));

    for (const old of this.#store) {
      const newEvent = newEvents.get(old.id);
      if (newEvent) {
        if (newEvent.status !== old.status)
          console.log(
            `Event "${newEvent.id}" changed status: "${old.status}" -> "${newEvent.status}"`,
          );

        const [newScores, oldScores] = [
          newEvent.scores.get("CURRENT"),
          old.scores.get("CURRENT"),
        ];
        if (
          newScores &&
          oldScores &&
          JSON.stringify(newScores) !== JSON.stringify(oldScores)
        )
          console.log(
            `Score of "${newEvent.id}" changed: ${oldScores.home}:${oldScores.away} -> ${newScores.home}:${newScores.away}`,
          );
      }
    }

    this.#store = [...data, ...removed];
  }

  get list(): SportEvent[] {
    return this.#store.filter((e) => e.status !== "REMOVED") as SportEvent[];
  }

  get historized() {
    return this.#store;
  }
}
