import { SportEventStateStore } from "./stateStore";
import { Period, SportEvent } from "./dataExtractor";

export class SportEventStateStoreDecorator extends SportEventStateStore {
  #withLoggedChanges(callback: () => void) {
    const getStatusesAndScores = () => {
      return new Map(
        this.store.entries().map(([id, event]) => {
          const eventPeriods = Object.keys(event.scores) as Period[];
          return [
            id,
            [
              event.status,
              ...eventPeriods.map((period) => event.scores.get(period)?.home),
              ...eventPeriods.map((period) => event.scores.get(period)?.away),
            ] as const,
          ];
        }),
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
