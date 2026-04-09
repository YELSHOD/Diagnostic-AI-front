import { create } from "zustand";
import type { Locale } from "@shared/i18n/messages";

type Theme = "dark" | "light";

type SettingsState = {
  apiBaseUrl: string;
  wsBaseUrl: string;
  reconnectMinMs: number;
  reconnectMaxMs: number;
  theme: Theme;
  locale: Locale;
  setApiBaseUrl: (v: string) => void;
  setWsBaseUrl: (v: string) => void;
  setReconnectMinMs: (v: number) => void;
  setReconnectMaxMs: (v: number) => void;
  setTheme: (v: Theme) => void;
  setLocale: (v: Locale) => void;
  resetDefaults: () => void;
};

const KEY = "diagnostic-ui-settings";
const defaults = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
  wsBaseUrl: import.meta.env.VITE_WS_BASE_URL ?? "ws://localhost:8080",
  reconnectMinMs: 800,
  reconnectMaxMs: 10_000,
  theme: "dark" as Theme,
  locale: "ru" as Locale
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
  apiBaseUrl: initial.apiBaseUrl ?? defaults.apiBaseUrl,
  wsBaseUrl: initial.wsBaseUrl ?? defaults.wsBaseUrl,
  reconnectMinMs: initial.reconnectMinMs ?? defaults.reconnectMinMs,
  reconnectMaxMs: initial.reconnectMaxMs ?? defaults.reconnectMaxMs,
  theme: initial.theme ?? defaults.theme,
  locale: initial.locale ?? defaults.locale,
  setApiBaseUrl: (apiBaseUrl) => set((state) => persist({ ...state, apiBaseUrl })),
  setWsBaseUrl: (wsBaseUrl) => set((state) => persist({ ...state, wsBaseUrl })),
  setReconnectMinMs: (reconnectMinMs) => set((state) => persist({ ...state, reconnectMinMs })),
  setReconnectMaxMs: (reconnectMaxMs) => set((state) => persist({ ...state, reconnectMaxMs })),
  setTheme: (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    set((state) => persist({ ...state, theme }));
  },
  setLocale: (locale) => {
    document.documentElement.lang = locale;
    set((state) => persist({ ...state, locale }));
  },
  resetDefaults: () => {
    document.documentElement.setAttribute("data-theme", defaults.theme);
    document.documentElement.lang = defaults.locale;
    set(() => persist({ ...defaults }));
  }
}));

function persist(state: Partial<SettingsState>) {
  localStorage.setItem(KEY, JSON.stringify(state));
  return state;
}
