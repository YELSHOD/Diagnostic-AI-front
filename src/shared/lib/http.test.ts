import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiGet, apiRequest } from "@shared/lib/http";
import { resetAuthStorage, saveAuthState } from "@features/auth/store";

describe("http auth requests", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    resetAuthStorage();
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("adds bearer token when auth session exists", async () => {
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

    vi.mocked(globalThis.fetch).mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await apiGet("/api/account");

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/account",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer access-token"
        })
      })
    );
  });

  it("sends json body for mutating requests", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await apiRequest("/api/auth/login", {
      method: "POST",
      body: {
        login: "dev.user",
        password: "strong-pass"
      }
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/auth/login",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          login: "dev.user",
          password: "strong-pass"
        })
      })
    );
  });
});
