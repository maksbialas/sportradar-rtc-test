type Config = {
  baseSimulationApiUrl: string;
  apiHost: string;
  apiPort: number;
  apiPath: string;
};

let config: Config | null = null;

export default function getConfig() {
  if (config) return config;

  const simulationApiUrl = process.env["RTC_API_URL"] ?? "http://localhost";
  const simulationApiPort = process.env["RTC_API_PORT"] ?? "3000";
  const simulationApiRootPath = process.env["RTC_API_ROOT_PATH"] ?? "/api";

  return (config = {
    baseSimulationApiUrl: `${simulationApiUrl}:${simulationApiPort}${simulationApiRootPath}`,
    apiHost: process.env["API_HOST"] ?? "localhost",
    apiPort: process.env["API_PORT"] ? parseInt(process.env["API_PORT"]) : 4000,
    apiPath: process.env["API_PATH"] ?? "/client/state",
  });
}

export function resetConfig() {
  config = null;
}
