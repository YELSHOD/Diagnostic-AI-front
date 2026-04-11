import { loadPersistedAuthState } from "@features/auth/store";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const SETTINGS_KEY = "diagnostic-ui-settings";

function runtimeApiBaseUrl(): string {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return API_BASE_URL;
    const parsed = JSON.parse(raw) as { apiBaseUrl?: string };
    return parsed.apiBaseUrl?.trim() || API_BASE_URL;
  } catch {
    return API_BASE_URL;
  }
}

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${runtimeApiBaseUrl()}${path}`, {
    signal,
    headers: authHeaders()
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
  return response.json() as Promise<T>;
}

export async function apiRequest<T>(
  path: string,
  init: {
    method?: "POST" | "PATCH" | "PUT" | "DELETE";
    body?: unknown;
    signal?: AbortSignal;
    auth?: boolean;
  } = {}
): Promise<T> {
  const headers = {
    ...(init.auth === false ? {} : authHeaders()),
    "Content-Type": "application/json"
  };
  const response = await fetch(`${runtimeApiBaseUrl()}${path}`, {
    method: init.method ?? "POST",
    signal: init.signal,
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body)
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export function buildQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && value.length > 0) search.set(key, value);
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

function authHeaders(): Record<string, string> {
  const { accessToken } = loadPersistedAuthState();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

async function readErrorMessage(response: Response): Promise<string> {
  const fallback = `HTTP ${response.status}: ${response.statusText}`;

  try {
    const payload = await response.clone().json() as {
      message?: string;
      detail?: string;
      error?: string;
      errors?: Array<{ defaultMessage?: string; message?: string }>;
    };

    if (payload.detail) return payload.detail;
    if (payload.message) return payload.message;
    if (payload.error && response.status < 500) return payload.error;
    if (payload.errors?.length) {
      const messages = payload.errors
        .map((entry) => entry.defaultMessage ?? entry.message)
        .filter(Boolean);
      if (messages.length > 0) return messages.join(". ");
    }
  } catch {
    try {
      const text = (await response.text()).trim();
      if (text) return text;
    } catch {
      return fallback;
    }
  }

  return fallback;
}
