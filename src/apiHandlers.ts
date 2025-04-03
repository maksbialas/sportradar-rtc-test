import Config from "./config";

abstract class BaseApiHandler<T extends { [dataKey: string]: string }, U> {
  abstract apiUrl: string;
  abstract dataKey: keyof T & string;

  #cache: { eTag: string; cachedData: unknown } | null = null;

  async #useCachedData(): Promise<unknown | null> {
    const { headers } = await fetch(this.apiUrl, {
      method: "HEAD",
    });

    if (headers.get("ETag") === this.#cache?.eTag) {
      return this.#cache.cachedData;
    } else {
      return null;
    }
  }

  async #fetchRawData(): Promise<unknown> {
    const response = await fetch(this.apiUrl, {
      method: "GET",
    });
    const data = response.json();

    // if eTag present, store data in cache
    const eTag = response.headers.get("ETag");
    if (eTag) {
      this.#cache = { eTag, cachedData: data };
    }

    return data;
  }

  #validate(body: unknown): asserts body is T {
    // typescript magic to allow body shape check on a generic function in abstract class
    const bodyAsRecord = body as Record<string, unknown> | null | undefined;
    if (typeof bodyAsRecord?.[this.dataKey] !== "string")
      throw new Error(`'${this.dataKey}' string not found in response`);
  }

  protected abstract extract(encoded: T): U;

  async getData(): Promise<U> {
    const cache = await this.#useCachedData();
    const data = cache ?? (await this.#fetchRawData()); // fetch data only on cache absent or outdated
    this.#validate(data);
    return this.extract(data);
  }
}

type StateAPIResponse = { odds: string };
export type StateResponseExtracted = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string | null,
];

export class StateApiHandler extends BaseApiHandler<
  StateAPIResponse,
  StateResponseExtracted[]
> {
  apiUrl = Config.instance.baseApiUrl + "/state";
  dataKey = "odds" as const;

  protected extract(encoded: StateAPIResponse): StateResponseExtracted[] {
    if (encoded.odds === "") return [];
    const extractedRecords: StateResponseExtracted[] = [];

    let lines = encoded.odds
      .replace(/(,\n?|\n)$/, "") // strip trailing newline / comma + newline
      .split("\n");

    for (const line of lines) {
      const splitLine = line
        .replace(/,$/, "") // strip trailing comma
        .split(",");

      if (splitLine.length > 8 || splitLine.length < 7)
        throw new Error(
          `Odds line '${splitLine}' has illegal size (${splitLine.length}).`,
        );

      if (splitLine.length === 7) {
        extractedRecords.push([...splitLine, null] as StateResponseExtracted);
      } else {
        extractedRecords.push(splitLine as StateResponseExtracted);
      }
    }

    return extractedRecords;
  }
}

type MappingsAPIResponse = { mappings: string };

export class MappingsApiHandler extends BaseApiHandler<
  MappingsAPIResponse,
  Map<string, string>
> {
  apiUrl = Config.instance.baseApiUrl + "/mappings";
  dataKey = "mappings" as const;

  protected extract(encoded: MappingsAPIResponse): Map<string, string> {
    if (encoded.mappings === "") return new Map();
    const keyValPairs: [string, string][] = [];

    const mappingsSplit = encoded.mappings
      .replace(/;$/, "") // strip trailing semicolon
      .split(";");

    for (const pair of mappingsSplit) {
      const [key, val] = pair.split(":");

      if (key === undefined || val === undefined)
        throw new Error("Mappings have an entry with no key or val.");

      keyValPairs.push([key, val]);
    }

    return new Map(keyValPairs);
  }
}
