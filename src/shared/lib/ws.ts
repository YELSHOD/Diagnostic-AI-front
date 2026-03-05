import type { WsMessage } from "@shared/types/api";

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL ?? "ws://localhost:8080";
const SETTINGS_KEY = "diagnostic-ui-settings";

export type ParsedWs =
  | { kind: "ok"; data: WsMessage }
  | { kind: "invalid"; reason: string };

export function runtimeWsBaseUrl(): string {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return WS_BASE_URL;
    const parsed = JSON.parse(raw) as { wsBaseUrl?: string };
    return parsed.wsBaseUrl?.trim() || WS_BASE_URL;
  } catch {
    return WS_BASE_URL;
  }
}

export function parseWsMessage(raw: string): ParsedWs {
  try {
    const obj = JSON.parse(raw) as Partial<WsMessage>;
    if (!obj || typeof obj !== "object") return { kind: "invalid", reason: "not-object" };
    if (!obj.type || !obj.ts || !obj.service) return { kind: "invalid", reason: "missing-fields" };
    if (!["LOG_LINE", "ERROR_EVENT", "CLUSTER_UPDATE"].includes(obj.type)) {
      return { kind: "invalid", reason: "bad-type" };
    }
    return { kind: "ok", data: obj as WsMessage };
  } catch {
    return { kind: "invalid", reason: "json-parse" };
  }
}
