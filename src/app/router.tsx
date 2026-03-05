import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { ShellLayout } from "@shared/ui/ShellLayout";
import { OverviewPage } from "@pages/OverviewPage";
import { ContainersPage } from "@pages/ContainersPage";
import { LiveLogsPage } from "@pages/LiveLogsPage";
import { AnalysisPage } from "@pages/AnalysisPage";
import { AiChatPage } from "@pages/AiChatPage";
import { SettingsPage } from "@pages/SettingsPage";

function Root() {
  return (
    <ShellLayout>
      <Outlet />
    </ShellLayout>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <Navigate to="/overview" replace /> },
      { path: "overview", element: <OverviewPage /> },
      { path: "containers", element: <ContainersPage /> },
      { path: "logs", element: <LiveLogsPage /> },
      { path: "analysis", element: <AnalysisPage /> },
      { path: "ai-chat", element: <AiChatPage /> },
      { path: "settings", element: <SettingsPage /> }
    ]
  }
]);
