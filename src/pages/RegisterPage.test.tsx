import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegisterPage } from "@pages/RegisterPage";
import { useAuthStore } from "@features/auth/store";

vi.mock("@features/auth/api", () => ({
  register: vi.fn()
}));

import { register } from "@features/auth/api";

describe("RegisterPage", () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
    vi.mocked(register).mockReset();
  });

  it("stores session after successful registration", async () => {
    vi.mocked(register).mockResolvedValue({
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
        <RegisterPage />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");
    await userEvent.type(screen.getByLabelText(/username/i), "dev.user");
    await userEvent.type(screen.getByLabelText(/^password$/i), "strong-pass");
    await userEvent.selectOptions(screen.getByLabelText(/role/i), "BACKEND");
    await userEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(useAuthStore.getState().currentUser?.username).toBe("dev.user");
    });

    expect(register).toHaveBeenCalledWith({
      email: "user@example.com",
      username: "dev.user",
      password: "strong-pass",
      role: "BACKEND"
    });
  });

  it("renders a landing-style registration page", () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Create access for your observability workspace/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/Choose your role once and keep the rest of the workflow simple/i)).toBeInTheDocument();
  });
});
