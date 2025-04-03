abstract class BaseApiHandler<T, U> {
  abstract apiUrl: string;
  abstract dataKey: string;
  protected abstract extract(encoded: T): U;

  async #fetchRawData(): Promise<unknown> {
    const response = await fetch(this.apiUrl);
    return response.json();
  }

  #validate(body: unknown): asserts body is T {
    // typescript magic to allow body shape check on a generic function in abstract class
    const bodyAsRecord = body as Record<string, unknown> | null | undefined;
    if (typeof bodyAsRecord?.[this.dataKey] !== "string")
      throw new TypeError(`'${this.dataKey}' string not found in response`);
  }

  async getData(): Promise<U> {
    const rawData = await this.#fetchRawData();
    this.#validate(rawData);
    return this.extract(rawData);
  }
}

type StateAPIResponse = { odds: string };
export type Tuple8 = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

export class StateApiHandler extends BaseApiHandler<
  StateAPIResponse,
  Tuple8[]
> {
  apiUrl = "http://localhost:3000/api/state";
  dataKey = "odds";

  protected extract(encoded: StateAPIResponse): Tuple8[] {
    const oddsUnmapped = encoded.odds
      .replaceAll(/,(\n|$)/g, "$1")
      .split("\n", -1)
      .map((sportEvent) => sportEvent.split(","));

    oddsUnmapped.forEach((sportEvent, idx) => {
      if (sportEvent.length !== 8)
        throw new TypeError(
          `'odds' contain elements with length different than 8 (row ${idx}: ${JSON.stringify(sportEvent)})`,
        );
    });

    return oddsUnmapped as Tuple8[];
  }
}

type MappingsAPIResponse = { mappings: string };

export class MappingsApiHandler extends BaseApiHandler<
  MappingsAPIResponse,
  Map<string, string>
> {
  apiUrl = "http://localhost:3000/api/mappings";
  dataKey = "mappings";

  protected extract(encoded: MappingsAPIResponse): Map<string, string> {
    const mappingsSplit = encoded.mappings
      .split(";")
      .map((mapping) => mapping.split(":"));

    mappingsSplit.forEach((mapping, idx) => {
      if (mapping.length !== 2)
        throw new TypeError(
          `'mappings' contain elements with length different than 2 (row ${idx})`,
        );
    });
    const mappingsTuples: [string, string][] = mappingsSplit as [
      string,
      string,
    ][];

    return new Map(mappingsTuples);
  }
}
