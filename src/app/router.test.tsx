import { render, screen } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { queryClient } from "@app/providers/query-client";
import { ProtectedShell, PublicOnly } from "@app/router";
import { useAuthStore } from "@features/auth/store";

describe("router auth protection", () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
  });

  it("redirects unauthenticated users to login", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/overview"]}>
          <Routes>
            <Route element={<PublicOnly />}>
              <Route path="/login" element={<h1>Login</h1>} />
            </Route>
            <Route path="/" element={<ProtectedShell />}>
              <Route path="/overview" element={<div>Overview</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByRole("heading", { name: /login/i })).toBeInTheDocument();
  });

  it("redirects authenticated users away from login", async () => {
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

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route element={<PublicOnly />}>
              <Route path="/login" element={<h1>Login</h1>} />
            </Route>
            <Route path="/" element={<ProtectedShell />}>
              <Route path="/overview" element={<div>Overview</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText("Overview")).toBeInTheDocument();
  });
});
