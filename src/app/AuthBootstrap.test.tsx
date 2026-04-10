import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthBootstrap } from "@app/AuthBootstrap";
import { useAuthStore } from "@features/auth/store";

vi.mock("@features/auth/api", () => ({
  me: vi.fn()
}));

import { me } from "@features/auth/api";

describe("AuthBootstrap", () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
    vi.mocked(me).mockReset();
  });

  it("hydrates current user from backend when token exists", async () => {
    useAuthStore.getState().setSession({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      currentUser: null
    });
    vi.mocked(me).mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      username: "dev.user",
      status: "ACTIVE",
      roles: ["BACKEND"]
    });

    render(<AuthBootstrap><div>app</div></AuthBootstrap>);

    await waitFor(() => {
      expect(useAuthStore.getState().currentUser?.username).toBe("dev.user");
    });
  });
});
