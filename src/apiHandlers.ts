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
    throw new Error("Not implemented");
  }
}

export type MappingsAPIResponse = { mappings: string };

export class MappingsApiHandler {
  apiUrl = "http://localhost:3000/api/mappings";
  async getData(): Promise<Map<string, string>> {
    throw new Error("Not implemented");
  }
}
