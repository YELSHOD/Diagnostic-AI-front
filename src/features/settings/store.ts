import { create } from "zustand";

type Theme = "dark" | "light";

type SettingsState = {
  apiBaseUrl: string;
  wsBaseUrl: string;
  reconnectMinMs: number;
  reconnectMaxMs: number;
  theme: Theme;
  setApiBaseUrl: (v: string) => void;
  setWsBaseUrl: (v: string) => void;
  setReconnectMinMs: (v: number) => void;
  setReconnectMaxMs: (v: number) => void;
  setTheme: (v: Theme) => void;
};

const KEY = "diagnostic-ui-settings";

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

const initial = load();

export const useSettingsStore = create<SettingsState>((set) => ({
  apiBaseUrl: initial.apiBaseUrl ?? (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"),
  wsBaseUrl: initial.wsBaseUrl ?? (import.meta.env.VITE_WS_BASE_URL ?? "ws://localhost:8080"),
  reconnectMinMs: initial.reconnectMinMs ?? 800,
  reconnectMaxMs: initial.reconnectMaxMs ?? 10_000,
  theme: initial.theme ?? "dark",
  setApiBaseUrl: (apiBaseUrl) => set((state) => persist({ ...state, apiBaseUrl })),
  setWsBaseUrl: (wsBaseUrl) => set((state) => persist({ ...state, wsBaseUrl })),
  setReconnectMinMs: (reconnectMinMs) => set((state) => persist({ ...state, reconnectMinMs })),
  setReconnectMaxMs: (reconnectMaxMs) => set((state) => persist({ ...state, reconnectMaxMs })),
  setTheme: (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    set((state) => persist({ ...state, theme }));
  }
}));

function persist(state: Partial<SettingsState>) {
  localStorage.setItem(KEY, JSON.stringify(state));
  return state;
}
