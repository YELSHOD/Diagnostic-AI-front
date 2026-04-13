import { beforeEach, describe, expect, it } from "vitest";
import { settingsDefaults, useSettingsStore } from "./store";

describe("settings store", () => {
  beforeEach(() => {
    localStorage.clear();
    useSettingsStore.getState().resetDefaults();
  });

  it("persists applied connection settings", () => {
    useSettingsStore.getState().applyConnectionSettings({
      apiBaseUrl: "http://localhost:8081",
      wsBaseUrl: "ws://localhost:8081",
      reconnectMinMs: 1_200,
      reconnectMaxMs: 9_000
    });

    const state = useSettingsStore.getState();
    expect(state.apiBaseUrl).toBe("http://localhost:8081");
    expect(state.wsBaseUrl).toBe("ws://localhost:8081");
    expect(state.reconnectMinMs).toBe(1_200);
    expect(state.reconnectMaxMs).toBe(9_000);
    expect(JSON.parse(localStorage.getItem("diagnostic-ui-settings") ?? "{}")).toMatchObject({
      apiBaseUrl: "http://localhost:8081",
      wsBaseUrl: "ws://localhost:8081",
      reconnectMinMs: 1_200,
      reconnectMaxMs: 9_000
    });
  });

  it("restores connection defaults without wiping other settings", () => {
    useSettingsStore.getState().setTheme("light");
    useSettingsStore.getState().setLocale("en");
    useSettingsStore.getState().applyConnectionSettings({
      apiBaseUrl: "http://localhost:8081",
      wsBaseUrl: "ws://localhost:8081",
      reconnectMinMs: 1_200,
      reconnectMaxMs: 9_000
    });

    useSettingsStore.getState().resetConnectionDefaults();

    const state = useSettingsStore.getState();
    expect(state.apiBaseUrl).toBe(settingsDefaults.apiBaseUrl);
    expect(state.wsBaseUrl).toBe(settingsDefaults.wsBaseUrl);
    expect(state.reconnectMinMs).toBe(settingsDefaults.reconnectMinMs);
    expect(state.reconnectMaxMs).toBe(settingsDefaults.reconnectMaxMs);
    expect(state.theme).toBe("light");
    expect(state.locale).toBe("en");
  });
});
