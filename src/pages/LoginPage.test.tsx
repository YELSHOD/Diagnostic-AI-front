import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginPage } from "@pages/LoginPage";
import { useAuthStore } from "@features/auth/store";
import { useSettingsStore } from "@features/settings/store";

vi.mock("@features/auth/api", () => ({
  login: vi.fn()
}));

import { login } from "@features/auth/api";

describe("LoginPage", () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
    useSettingsStore.getState().setLocale("en");
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

  it("renders a landing-style auth entry", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getAllByText(/Diagnostic AI/i)).toHaveLength(2);
    expect(screen.getByText(/One local platform for logs and investigation/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /register/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email or username/i)).toBeVisible();
    expect(screen.getByLabelText(/password/i)).toBeVisible();
    expect(screen.getByText(/Built for local diagnostics, clusters, and AI-ready investigation/i)).toBeInTheDocument();
  });

  it("renders localized auth copy", () => {
    useSettingsStore.getState().setLocale("ru");

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Локальная платформа для логов и расследования/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Регистрация/i })).toBeInTheDocument();
  });

  it("shows validation before submitting empty login form", async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/enter an email or username/i);
    expect(login).not.toHaveBeenCalled();
  });
});
