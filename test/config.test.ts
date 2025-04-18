import { afterEach, describe, expect, it, vi } from "vitest";
import getConfig, { resetConfig } from "../src/config";

describe("Config", () => {
  afterEach(() => {
    resetConfig();
    vi.unstubAllEnvs();
  });

  it("should correctly construct default baseApiUrl", () => {
    const config = getConfig();

    expect(config.baseSimulationApiUrl).toBe("http://localhost:3000/api");
  });

  it("should correctly construct baseApiUrl from ENV", () => {
    vi.stubEnv("RTC_API_URL", "https://fake.api");
    vi.stubEnv("RTC_API_PORT", "8080");
    vi.stubEnv("RTC_API_ROOT_PATH", "/test");

    const config = getConfig();

    expect(config.baseSimulationApiUrl).toBe("https://fake.api:8080/test");
  });

  it("should correctly construct default API host, port and path", () => {
    const config = getConfig();

    expect(config.apiHost).toBe("localhost");
    expect(config.apiPort).toBe(4000);
    expect(config.apiPath).toBe("/client/state");
  });

  it("should correctly construct baseApiUrl from ENV", () => {
    vi.stubEnv("API_HOST", "1.2.3.4");
    vi.stubEnv("API_PORT", "2222");
    vi.stubEnv("API_PATH", "/test/path");

    const config = getConfig();

    expect(config.apiHost).toBe("1.2.3.4");
    expect(config.apiPort).toBe(2222);
    expect(config.apiPath).toBe("/test/path");
  });

  it("should be constructed only once", () => {
    const config1 = getConfig();
    const config2 = getConfig();
    expect(config1).toBe(config2); // strict equality check to verify only one instance
  });
});
