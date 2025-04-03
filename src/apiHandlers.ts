import Config from "./config";

abstract class BaseApiHandler<T extends { [dataKey: string]: string }, U> {
  abstract apiUrl: string;
  abstract dataKey: keyof T & string;
  protected abstract encodingValidationRegex: RegExp;

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
    if (typeof bodyAsRecord?.[this.dataKey] !== "string") {
      console.error(
        `'${this.dataKey}' string not found in response ${JSON.stringify(body)}`,
      );
      throw new Error(`'${this.dataKey}' string not found in response`);
    }
  }

  #checkEncoding(data: T) {
    if (!this.encodingValidationRegex.test(data[this.dataKey])) {
      console.error(`Cannot decode '${this.dataKey}': ${data[this.dataKey]}`);
      throw new Error(
        `Cannot decode '${this.dataKey}' - encoding is corrupted`,
      );
    }
  }

  protected abstract extract(encoded: T): U;

  async getData(): Promise<U> {
    const cache = await this.#useCachedData();
    const data = cache ?? (await this.#fetchRawData()); // fetch data only on cache absent or outdated
    this.#validate(data);
    this.#checkEncoding(data);
    return this.extract(data);
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
  apiUrl = Config.instance.baseApiUrl + "/state";
  dataKey = "odds" as const;
  protected encodingValidationRegex =
    /^(([\w\-@|:]+,){7}[\w\-@|:]+\n)+([\w\-@|:]+,){7}[\w\-@|:]+/;

  protected extract(encoded: StateAPIResponse): Tuple8[] {
    return encoded.odds
      .replaceAll(/,(\n|$)/g, "$1")
      .split("\n", -1)
      .map((sportEvent) => sportEvent.split(",")) as Tuple8[];
  }
}

type MappingsAPIResponse = { mappings: string };

export class MappingsApiHandler extends BaseApiHandler<
  MappingsAPIResponse,
  Map<string, string>
> {
  apiUrl = Config.instance.baseApiUrl + "/mappings";
  dataKey = "mappings" as const;
  protected encodingValidationRegex =
    /^([\w\-]+:[\w\s\-]+)(;[\w\-]+:[\w\s\-]+)*$/;

  protected extract(encoded: MappingsAPIResponse): Map<string, string> {
    const mappingsSplit = encoded.mappings
      .split(";")
      .map((mapping) => mapping.split(":")) as [string, string][];

    return new Map(mappingsSplit);
  }
}
