import { create } from "zustand";

const AUTH_KEY = "diagnostic-ui-auth";

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  status: string;
  roles: string[];
};

type PersistedAuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  currentUser: AuthUser | null;
};

export type AuthState = PersistedAuthState & {
  isAuthenticated: boolean;
  setSession: (session: PersistedAuthState) => void;
  setCurrentUser: (currentUser: AuthUser | null) => void;
  clearSession: () => void;
};

export function createAuthState(): AuthState {
  const persisted = loadAuthState();
  return {
    ...persisted,
    isAuthenticated: Boolean(persisted.accessToken && persisted.currentUser),
    setSession: () => undefined,
    setCurrentUser: () => undefined,
    clearSession: () => undefined
  };
}

export function saveAuthState(state: PersistedAuthState) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(state));
}

export function resetAuthStorage() {
  localStorage.removeItem(AUTH_KEY);
}

export function loadPersistedAuthState(): PersistedAuthState {
  return loadAuthState();
}

function loadAuthState(): PersistedAuthState {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) {
      return emptyState();
    }
    const parsed = JSON.parse(raw) as Partial<PersistedAuthState>;
    return {
      accessToken: parsed.accessToken ?? null,
      refreshToken: parsed.refreshToken ?? null,
      currentUser: parsed.currentUser ?? null
    };
  } catch {
    return emptyState();
  }
}

function emptyState(): PersistedAuthState {
  return {
    accessToken: null,
    refreshToken: null,
    currentUser: null
  };
}

export const useAuthStore = create<AuthState>((set) => {
  const initial = createAuthState();
  return {
    ...initial,
    setSession: (session) =>
      set(() => {
        saveAuthState(session);
        return {
          ...session,
          isAuthenticated: Boolean(session.accessToken && session.currentUser)
        };
      }),
    setCurrentUser: (currentUser) =>
      set((state) => {
        const next = {
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          currentUser
        };
        saveAuthState(next);
        return {
          ...next,
          isAuthenticated: Boolean(state.accessToken && currentUser)
        };
      }),
    clearSession: () =>
      set(() => {
        resetAuthStorage();
        return {
          ...emptyState(),
          isAuthenticated: false
        };
      })
  };
});
