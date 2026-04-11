import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@features/auth/store";
import { ShellLayout } from "@shared/ui/ShellLayout";

vi.mock("@features/auth/api", () => ({
  logout: vi.fn()
}));

import { logout } from "@features/auth/api";

describe("ShellLayout profile menu", () => {
  beforeEach(() => {
    vi.mocked(logout).mockReset();
    useAuthStore.getState().clearSession();
    useAuthStore.getState().setSession({
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
  });

  it("shows authenticated user details in the profile menu", async () => {
    render(
      <MemoryRouter>
        <ShellLayout>
          <div>content</div>
        </ShellLayout>
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole("button", { name: /профиль|profile/i }));

    expect(screen.getByRole("link", { name: /runtime targets|runtime target|targets|мақсаттар|таргеттер/i })).toBeInTheDocument();
    expect(screen.getByText("dev.user")).toBeInTheDocument();
    expect(screen.getByText("BACKEND")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /учетные данные|account/i })).toBeInTheDocument();
  });

  it("calls backend logout before clearing the session", async () => {
    vi.mocked(logout).mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <ShellLayout>
          <div>content</div>
        </ShellLayout>
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole("button", { name: /профиль|profile/i }));
    await userEvent.click(screen.getByRole("button", { name: /выход|exit/i }));

    expect(logout).toHaveBeenCalledWith("refresh-token");
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
