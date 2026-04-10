import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccountPage } from "@pages/AccountPage";
import { useAuthStore } from "@features/auth/store";
import { useSettingsStore } from "@features/settings/store";

vi.mock("@features/auth/api", () => ({
  getAccount: vi.fn(),
  updateAccount: vi.fn(),
  changePassword: vi.fn()
}));

import { changePassword, getAccount, updateAccount } from "@features/auth/api";

describe("AccountPage", () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
    useSettingsStore.getState().setLocale("en");
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
    vi.mocked(getAccount).mockReset();
    vi.mocked(updateAccount).mockReset();
    vi.mocked(changePassword).mockReset();
  });

  it("loads and updates account details", async () => {
    vi.mocked(getAccount).mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      username: "dev.user",
      status: "ACTIVE",
      roles: ["BACKEND"]
    });
    vi.mocked(updateAccount).mockResolvedValue({
      id: "user-1",
      email: "new@example.com",
      username: "new.user",
      status: "ACTIVE",
      roles: ["BACKEND"]
    });
    vi.mocked(changePassword).mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <AccountPage />
      </MemoryRouter>
    );

    expect(await screen.findByDisplayValue("user@example.com")).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText(/^email$/i));
    await userEvent.type(screen.getByLabelText(/^email$/i), "new@example.com");
    await userEvent.clear(screen.getByLabelText(/username/i));
    await userEvent.type(screen.getByLabelText(/username/i), "new.user");
    await userEvent.click(screen.getByRole("button", { name: /save account/i }));

    await waitFor(() => {
      expect(useAuthStore.getState().currentUser?.username).toBe("new.user");
    });

    await userEvent.type(screen.getByLabelText(/current password/i), "old-pass");
    await userEvent.type(screen.getByLabelText(/new password/i), "new-pass-123");
    await userEvent.click(screen.getByRole("button", { name: /change password/i }));

    expect(updateAccount).toHaveBeenCalledWith({
      email: "new@example.com",
      username: "new.user"
    });
    expect(changePassword).toHaveBeenCalledWith({
      currentPassword: "old-pass",
      newPassword: "new-pass-123"
    });
  });

  it("renders separate profile and password sections", async () => {
    vi.mocked(getAccount).mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      username: "dev.user",
      status: "ACTIVE",
      roles: ["BACKEND"]
    });
    vi.mocked(updateAccount).mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      username: "dev.user",
      status: "ACTIVE",
      roles: ["BACKEND"]
    });
    vi.mocked(changePassword).mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <AccountPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Profile details/i)).toBeInTheDocument();
    expect(screen.getByText(/Password security/i)).toBeInTheDocument();
    expect(screen.getByText(/Manage workspace identity and security from one place/i)).toBeInTheDocument();
  });
});
