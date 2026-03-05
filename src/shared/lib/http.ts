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
  const response = await fetch(`${runtimeApiBaseUrl()}${path}`, { signal });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
