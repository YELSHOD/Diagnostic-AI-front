import { beforeEach, describe, expect, it } from "vitest";
import { createAuthState, resetAuthStorage, saveAuthState } from "@features/auth/store";

describe("auth store persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("hydrates session from local storage", () => {
    saveAuthState({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      currentUser: {
        id: "user-1",
        email: "user@example.com",
        username: "dev.user",
        status: "ACTIVE",
        roles: ["BACKEND"]
      }
    });

    const state = createAuthState();

    expect(state.accessToken).toBe("access-token");
    expect(state.refreshToken).toBe("refresh-token");
    expect(state.currentUser?.username).toBe("dev.user");
    expect(state.isAuthenticated).toBe(true);
  });

  it("clears persisted session on reset", () => {
    saveAuthState({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      currentUser: {
        id: "user-1",
        email: "user@example.com",
        username: "dev.user",
        status: "ACTIVE",
        roles: ["BACKEND"]
      }
    });

    resetAuthStorage();
    const state = createAuthState();

    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.currentUser).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
