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
    const data = await response.json();
    const oddsEncoded: string = data.odds;

    const oddsUnmapped = oddsEncoded
      .split(",\n")
      .map((sportEvent) => sportEvent.split(","));

    return oddsUnmapped as Tuple8[];
  }
}

export type MappingsAPIResponse = { mappings: string };

export class MappingsApiHandler {
  apiUrl = "http://localhost:3000/api/mappings";
  async getData(): Promise<Map<string, string>> {
    const response = await fetch(this.apiUrl);
    const data = await response.json();
    const mappingsEncoded: string = data.mappings;

    const mappingsSplit = mappingsEncoded
      .split(";")
      .map((mapping) => mapping.split(":"));

    const mappingsTuples: [string, string][] = mappingsSplit as [
      string,
      string,
    ][];

    return new Map(mappingsTuples);
  }
}
