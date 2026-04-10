import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginPage } from "@pages/LoginPage";
import { useAuthStore } from "@features/auth/store";

vi.mock("@features/auth/api", () => ({
  login: vi.fn()
}));

import { login } from "@features/auth/api";

describe("LoginPage", () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
    vi.mocked(login).mockReset();
  });

  it("stores session after successful login", async () => {
    vi.mocked(login).mockResolvedValue({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      user: {
        id: "user-1",
        email: "user@example.com",
        username: "dev.user",
        status: "ACTIVE",
        roles: ["BACKEND"]
      }
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/email or username/i), "dev.user");
    await userEvent.type(screen.getByLabelText(/password/i), "strong-pass");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(useAuthStore.getState().currentUser?.username).toBe("dev.user");
    });

    expect(login).toHaveBeenCalledWith({
      login: "dev.user",
      password: "strong-pass"
    });
  });

  it("renders a product-grade auth shell", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Local observability, ready for AI-assisted investigation/i)).toBeInTheDocument();
    expect(screen.getByText(/Unified access to logs, clusters, analytics, and live investigation/i)).toBeInTheDocument();
    expect(screen.getByText(/Workspace access/i)).toBeInTheDocument();
  });
});
