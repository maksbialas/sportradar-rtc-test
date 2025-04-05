import { SportEvent } from "./dataExtractor";

type SportEventHistorized = Omit<SportEvent, "status"> & {
  status: "REMOVED" | SportEvent["status"];
};

export class SportEventStateStore {
  protected store: Map<SportEventHistorized["id"], SportEventHistorized> =
    new Map();

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

export function scoresLogged(
  stateStore: SportEventStateStore,
): SportEventStateStore {
  const originalUpdate = stateStore.update.bind(stateStore);

  stateStore.update = function (data: SportEvent[]) {
    const getScores = () =>
      new Map(
        stateStore.store
          .entries()
          .map(([id, event]) => [id, event.scores.get("CURRENT")]),
      );

    const oldScores = getScores();
    originalUpdate(data);
    const newScores = getScores();

    for (const [oldId, oldScore] of oldScores) {
      const updatedScore = newScores.get(oldId)!;
      if (
        oldScore !== undefined &&
        (oldScore.home !== updatedScore.home ||
          oldScore.away !== updatedScore.away)
      )
        console.log(
          `Score of "${oldId}" changed: ${oldScore.home}:${oldScore.away} -> ${updatedScore.home}:${updatedScore.away}`,
        );
    }
  };

  return stateStore;
}

export function statusLogged(
  stateStore: SportEventStateStore,
): SportEventStateStore {
  const originalUpdate = stateStore.update.bind(stateStore);

  stateStore.update = function (data: SportEvent[]) {
    const getStatuses = () =>
      new Map(
        stateStore.store.entries().map(([id, event]) => [id, event.status]),
      );

    const oldStatuses = getStatuses();
    originalUpdate(data);
    const newStatuses = getStatuses();

    for (const [oldId, oldStatus] of oldStatuses) {
      const updatedStatus = newStatuses.get(oldId)!;
      if (oldStatus !== updatedStatus)
        console.log(
          `Event "${oldId}" changed status: "${oldStatus}" -> "${updatedStatus}"`,
        );
    }
  };

  return stateStore;
}
