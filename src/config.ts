export default class Config {
  static #instance: Config | null;

  baseSimulationApiUrl: string;
  apiHost: string;
  apiPort: number;
  apiPath: string;

  // private constructor to avoid direct construction with the 'new' operator
  private constructor() {
    const simulationApiUrl = process.env["RTC_API_URL"] ?? "http://localhost";
    const simulationApiPort = process.env["RTC_API_PORT"] ?? "3000";
    const simulationApiRootPath = process.env["RTC_API_ROOT_PATH"] ?? "/api";

    this.baseSimulationApiUrl = `${simulationApiUrl}:${simulationApiPort}${simulationApiRootPath}`;
    this.apiHost = process.env["API_HOST"] ?? "localhost";
    this.apiPort = process.env["API_PORT"]
      ? parseInt(process.env["API_PORT"])
      : 4000;
    this.apiPath = process.env["API_PATH"] ?? "/client/state";
  }

  static get instance(): Config {
    return Config.#instance ?? (Config.#instance = new Config());
  }

  static reset() {
    Config.#instance = null;
  }
}
