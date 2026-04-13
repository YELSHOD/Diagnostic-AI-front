import { create } from "zustand";
import type { Locale } from "@shared/i18n/messages";

type Theme = "dark" | "light";

type ConnectionSettings = {
  apiBaseUrl: string;
  wsBaseUrl: string;
  reconnectMinMs: number;
  reconnectMaxMs: number;
};

type SettingsState = ConnectionSettings & {
  theme: Theme;
  locale: Locale;
  sidebarCollapsed: boolean;
  setApiBaseUrl: (v: string) => void;
  setWsBaseUrl: (v: string) => void;
  setReconnectMinMs: (v: number) => void;
  setReconnectMaxMs: (v: number) => void;
  applyConnectionSettings: (next: ConnectionSettings) => void;
  resetConnectionDefaults: () => void;
  setTheme: (v: Theme) => void;
  setLocale: (v: Locale) => void;
  toggleSidebar: () => void;
  resetDefaults: () => void;
};

const KEY = "diagnostic-ui-settings";

export const settingsDefaults = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
  wsBaseUrl: import.meta.env.VITE_WS_BASE_URL ?? "ws://localhost:8080",
  reconnectMinMs: 800,
  reconnectMaxMs: 10_000,
  theme: "dark" as Theme,
  locale: "ru" as Locale,
  sidebarCollapsed: false
};

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

const initial = load();

export const useSettingsStore = create<SettingsState>((set) => ({
  apiBaseUrl: initial.apiBaseUrl ?? settingsDefaults.apiBaseUrl,
  wsBaseUrl: initial.wsBaseUrl ?? settingsDefaults.wsBaseUrl,
  reconnectMinMs: initial.reconnectMinMs ?? settingsDefaults.reconnectMinMs,
  reconnectMaxMs: initial.reconnectMaxMs ?? settingsDefaults.reconnectMaxMs,
  theme: initial.theme ?? settingsDefaults.theme,
  locale: initial.locale ?? settingsDefaults.locale,
  sidebarCollapsed: initial.sidebarCollapsed ?? settingsDefaults.sidebarCollapsed,
  setApiBaseUrl: (apiBaseUrl) => set((state) => persist({ ...state, apiBaseUrl })),
  setWsBaseUrl: (wsBaseUrl) => set((state) => persist({ ...state, wsBaseUrl })),
  setReconnectMinMs: (reconnectMinMs) => set((state) => persist({ ...state, reconnectMinMs })),
  setReconnectMaxMs: (reconnectMaxMs) => set((state) => persist({ ...state, reconnectMaxMs })),
  applyConnectionSettings: (next) => set((state) => persist({ ...state, ...next })),
  resetConnectionDefaults: () =>
    set((state) =>
      persist({
        ...state,
        apiBaseUrl: settingsDefaults.apiBaseUrl,
        wsBaseUrl: settingsDefaults.wsBaseUrl,
        reconnectMinMs: settingsDefaults.reconnectMinMs,
        reconnectMaxMs: settingsDefaults.reconnectMaxMs
      })
    ),
  setTheme: (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    set((state) => persist({ ...state, theme }));
  },
  setLocale: (locale) => {
    document.documentElement.lang = locale;
    set((state) => persist({ ...state, locale }));
  },
  toggleSidebar: () => set((state) => persist({ ...state, sidebarCollapsed: !state.sidebarCollapsed })),
  resetDefaults: () => {
    document.documentElement.setAttribute("data-theme", settingsDefaults.theme);
    document.documentElement.lang = settingsDefaults.locale;
    set(() => persist({ ...settingsDefaults }));
  }
}));

function persist(state: Partial<SettingsState>) {
  localStorage.setItem(KEY, JSON.stringify(state));
  return state;
}
