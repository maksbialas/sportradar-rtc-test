export type StateAPIResponse = { odds: string };
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

export class StateApiHandler {
  apiUrl = "http://localhost:3000/api/state";
  async getData(): Promise<Tuple8[]> {
    const response = await fetch(this.apiUrl);
    const data: unknown = await response.json();

    if (
      typeof data !== "object" ||
      data === null ||
      !("odds" in data) ||
      typeof data.odds !== "string"
    )
      throw new TypeError("'odds' string not found in response");

    const oddsEncoded = data.odds;

    const oddsUnmapped = oddsEncoded
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

export type MappingsAPIResponse = { mappings: string };

export class MappingsApiHandler {
  apiUrl = "http://localhost:3000/api/mappings";
  async getData(): Promise<Map<string, string>> {
    const response = await fetch(this.apiUrl);
    const data: unknown = await response.json();

    if (
      typeof data !== "object" ||
      data === null ||
      !("mappings" in data) ||
      typeof data.mappings !== "string"
    )
      throw new TypeError("'mappings' string not found in response");

    const mappingsEncoded = data.mappings;

    const mappingsSplit = mappingsEncoded
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
