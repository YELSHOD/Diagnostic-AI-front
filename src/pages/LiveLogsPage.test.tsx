import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRealtimeStore } from "@features/realtime/store";
import { useSettingsStore } from "@features/settings/store";
import { LiveLogsPage } from "./LiveLogsPage";

vi.mock("@features/realtime/useLogsSocket", () => ({
  useLogsSocket: vi.fn()
}));

vi.mock("@entities/runtime-target/api", () => ({
  useRuntimeTargets: vi.fn()
}));

import { useRuntimeTargets } from "@entities/runtime-target/api";

function renderPage(initialEntry = "/logs?runtimeTargetId=local-backend") {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/logs" element={<LiveLogsPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("LiveLogsPage", () => {
  beforeEach(() => {
    localStorage.clear();
    useSettingsStore.getState().setLocale("en");
    vi.mocked(useRuntimeTargets).mockReset();
    vi.mocked(useRuntimeTargets).mockReturnValue({
      data: [
        {
          id: "local-backend",
          name: "diagnosticserviceai",
          type: "LOCAL_SERVICE",
          status: "UP",
          host: "localhost",
          port: 8080,
          healthUrl: "http://localhost:8080/actuator/health",
          logSourceType: "FILE_TAIL",
          logSourceRef: "./logs/diagnosticserviceai.log",
          metadata: {}
        }
      ],
      isLoading: false,
      error: null
    } as never);
    useRealtimeStore.setState({
      connected: true,
      selectedContainerId: "local-backend",
      logs: [
        {
          ts: "2026-04-11T12:00:00Z",
          service: "diagnosticserviceai",
          payload: {
            message: "User login succeeded",
            level: "INFO",
            traceId: null
          }
        }
      ],
      errors: [
        {
          ts: "2026-04-11T12:00:01Z",
          service: "diagnosticserviceai",
          payload: {
            service: "diagnosticserviceai",
            eventTime: "2026-04-11T12:00:01Z",
            traceId: null,
            exceptionType: "java.lang.IllegalStateException",
            message: "boom",
            topFrames: ["frame-1"],
            stacktrace: "frame-1",
            context: []
          }
        }
      ],
      clusters: {}
    });
  });

  it("shows runtime target name in the console toolbar", () => {
    renderPage();

    expect(screen.getByText(/selected runtime target: diagnosticserviceai/i)).toBeInTheDocument();
    expect(screen.queryByText(/selected runtime target: local-backend/i)).not.toBeInTheDocument();
  });

  it("renders a console viewport instead of dashboard KPI cards", () => {
    renderPage();

    expect(screen.getByTestId("logs-console")).toBeInTheDocument();
    expect(screen.queryByText(/visible lines/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/error events/i)).not.toBeInTheDocument();
    expect(screen.getByText(/user login succeeded/i)).toBeInTheDocument();
  });

  it("renders hybrid console columns for level, time, source, and message", () => {
    renderPage();

    expect(screen.getByText("Level")).toBeInTheDocument();
    expect(screen.getByText("Time")).toBeInTheDocument();
    expect(screen.getByText("Source")).toBeInTheDocument();
    expect(screen.getByText("Message")).toBeInTheDocument();
  });

  it("clears the client-side stream when clear is pressed", async () => {
    const user = userEvent.setup();

    renderPage();
    await user.click(screen.getByRole("button", { name: /clear/i }));

    expect(screen.queryByText(/user login succeeded/i)).not.toBeInTheDocument();
  });

  it("keeps latest error details collapsed until expanded", async () => {
    const user = userEvent.setup();

    renderPage();

    expect(screen.queryByText(/java.lang.IllegalStateException/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /show latest error/i }));

    expect(screen.getByText(/java.lang.IllegalStateException/i)).toBeInTheDocument();
    expect(screen.getByText(/boom/i)).toBeInTheDocument();
  });

  it("pauses follow mode when the user scrolls upward", async () => {
    renderPage();

    const viewport = screen.getByTestId("logs-console");
    Object.defineProperty(viewport, "scrollTop", {
      value: 10,
      writable: true
    });
    Object.defineProperty(viewport, "scrollHeight", {
      value: 500,
      writable: true
    });
    Object.defineProperty(viewport, "clientHeight", {
      value: 200,
      writable: true
    });

    fireEvent.scroll(viewport);

    expect(screen.getByRole("button", { name: /paused/i })).toBeInTheDocument();
  });
});
