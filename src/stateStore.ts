import { SportEvent } from "./dataExtractor";

type SportEventHistorized = Omit<SportEvent, "status"> & {
  status: "REMOVED" | SportEvent["status"];
};

export class SportEventStateStore {
  protected store: Map<string, SportEventHistorized> = new Map();

  update(data: SportEvent[]) {
    const oldEntries: [string, SportEventHistorized][] = this.store
      .entries()
      .toArray()
      .map(([id, event]) => [id, { ...event, status: "REMOVED" }]);

    const newEntries: [string, SportEvent][] = data.map((event) => [
      event.id,
      event,
    ]);

    this.store = new Map([...oldEntries, ...newEntries]);
  }

  get list(): SportEvent[] {
    return [
      ...this.store.values().filter((e) => e.status !== "REMOVED"),
    ] as SportEvent[];
  }

  get historized(): SportEventHistorized[] {
    return [...this.store.values()];
  }
}

const logger =
  <T>(
    extract: (entry: SportEventHistorized) => T | undefined,
    compare: (old: T, updated: T) => boolean,
    log: (id: string, old: T, updated: T) => string,
  ) =>
  (stateStore: SportEventStateStore) => {
    const originalUpdate = stateStore.update.bind(stateStore);

    stateStore.update = function (data: SportEvent[]) {
      const getValToCompare = () =>
        new Map(
          stateStore.store.entries().map(([id, event]) => [id, extract(event)]),
        );

      const oldVals = getValToCompare();
      originalUpdate(data);
      const newVals = getValToCompare();

      for (const [oldId, oldEntry] of oldVals) {
        const updatedEntry = newVals.get(oldId)!;
        if (oldEntry !== undefined && compare(oldEntry, updatedEntry))
          console.log(log(oldId, oldEntry, updatedEntry));
      }
    };

    return stateStore;
  };

export const scoresLogged = logger(
  (event) => event.scores.get("CURRENT"),
  (old, updated) => old.home !== updated.home || old.away !== updated.away,
  (id, old, updated) =>
    `Score of "${id}" changed: ${old.home}:${old.away} -> ${updated.home}:${updated.away}`,
);

export const statusLogged = logger(
  (event) => event.status,
  (old, updated) => old !== updated,
  (id, old, updated) =>
    `Event "${id}" changed status: "${old}" -> "${updated}"`,
);
