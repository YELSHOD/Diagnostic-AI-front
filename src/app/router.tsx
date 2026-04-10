import { createBrowserRouter, Navigate, Outlet, type RouteObject } from "react-router-dom";
import { useAuthStore } from "@features/auth/store";
import { ShellLayout } from "@shared/ui/ShellLayout";
import { OverviewPage } from "@pages/OverviewPage";
import { ContainersPage } from "@pages/ContainersPage";
import { LiveLogsPage } from "@pages/LiveLogsPage";
import { AnalysisPage } from "@pages/AnalysisPage";
import { AiChatPage } from "@pages/AiChatPage";
import { SettingsPage } from "@pages/SettingsPage";
import { LoginPage } from "@pages/LoginPage";
import { RegisterPage } from "@pages/RegisterPage";
import { AccountPage } from "@pages/AccountPage";

export function ProtectedShell() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ShellLayout>
      <Outlet />
    </ShellLayout>
  );
}

export function PublicOnly() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/overview" replace />;
  }

  return <Outlet />;
}

export const routes: RouteObject[] = [
  {
    element: <PublicOnly />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> }
    ]
  },
  {
    path: "/",
    element: <ProtectedShell />,
    children: [
      { index: true, element: <Navigate to="/overview" replace /> },
      { path: "overview", element: <OverviewPage /> },
      { path: "containers", element: <ContainersPage /> },
      { path: "logs", element: <LiveLogsPage /> },
      { path: "analysis", element: <AnalysisPage /> },
      { path: "ai-chat", element: <AiChatPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "account", element: <AccountPage /> }
    ]
  }
];

export const router = createBrowserRouter(routes);
