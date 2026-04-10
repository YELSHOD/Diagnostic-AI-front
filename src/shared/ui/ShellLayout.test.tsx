import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "@features/auth/store";
import { ShellLayout } from "@shared/ui/ShellLayout";

describe("ShellLayout profile menu", () => {
  beforeEach(() => {
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

    expect(screen.getByText("dev.user")).toBeInTheDocument();
    expect(screen.getByText("BACKEND")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /учетные данные|account/i })).toBeInTheDocument();
  });
});
