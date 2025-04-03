import { afterEach, describe, expect, it, vi } from "vitest";
import Config from "../src/config";

describe("Config", () => {
  afterEach(() => {
    Config.reset();
    vi.unstubAllEnvs();
  });

  it("should correctly construct default baseApiUrl", () => {
    const config = Config.instance;

    expect(config.baseApiUrl).toBe("http://localhost:3000/api");
  });

  it("should correctly construct default baseApiUrl1", () => {
    vi.stubEnv("RTC_API_URL", "https://fake.api");
    vi.stubEnv("RTC_API_PORT", "8080");
    vi.stubEnv("RTC_API_ROOT_PATH", "/test");

    const config = Config.instance;

    expect(config.baseApiUrl).toBe("https://fake.api:8080/test");
  });

  it("should be constructed only once", () => {
    const config1 = Config.instance;
    const config2 = Config.instance;
    expect(config1).toBe(config2); // strict equality check to verify only one instance
  });
});
