import { SportEvent } from "./dataExtractor";

type SportEventHistorized = Omit<SportEvent, "status"> & {
  status: "REMOVED" | SportEvent["status"];
};

class SportEventStateStoreBase {
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

export class SportEventStateStore extends SportEventStateStoreBase {
  #withLoggedChanges(callback: () => void) {
    const getStatusesAndScores = () => {
      return new Map(
        this.store
          .entries()
          .map(([id, event]) => [
            id,
            [
              event.status,
              event.scores.get("CURRENT")?.home,
              event.scores.get("CURRENT")?.away,
            ] as const,
          ]),
      );
    };

    const old = getStatusesAndScores();
    callback();
    const updated = getStatusesAndScores();

    for (const [oldId, [oldStatus, oldHomeScore, oldAwayScore]] of old) {
      const [updatedStatus, updatedHomeScore, updatedAwayScore] =
        updated.get(oldId)!;
      if (oldStatus !== updatedStatus)
        console.log(
          `Event "${oldId}" changed status: "${oldStatus}" -> "${updatedStatus}"`,
        );
      if (
        oldHomeScore !== undefined &&
        (oldHomeScore !== updatedHomeScore || oldAwayScore !== updatedAwayScore)
      )
        console.log(
          `Score of "${oldId}" changed: ${oldHomeScore}:${oldAwayScore} -> ${updatedHomeScore}:${updatedAwayScore}`,
        );
    }
  }

  update(data: SportEvent[]) {
    this.#withLoggedChanges(() => super.update(data));
  }
}
