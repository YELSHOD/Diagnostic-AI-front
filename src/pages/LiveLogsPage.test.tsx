import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useRealtimeStore } from "@features/realtime/store";
import { useSettingsStore } from "@features/settings/store";
import { LiveLogsPage } from "./LiveLogsPage";

vi.mock("@features/realtime/useLogsSocket", () => ({
  useLogsSocket: vi.fn()
}));

vi.mock("@entities/runtime-target/api", () => ({
  useRuntimeTargets: vi.fn()
}));

vi.mock("@features/ai/api", () => ({
  diagnoseLogsWithGemini: vi.fn()
}));

import { useRuntimeTargets } from "@entities/runtime-target/api";
import { diagnoseLogsWithGemini } from "@features/ai/api";

function toDatetimeLocalValue(input: string) {
  const date = new Date(input);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hour = `${date.getHours()}`.padStart(2, "0");
  const minute = `${date.getMinutes()}`.padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

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
    vi.useRealTimers();
    useSettingsStore.getState().setLocale("en");
    vi.mocked(useRuntimeTargets).mockReset();
    vi.mocked(diagnoseLogsWithGemini).mockReset();
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

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows runtime target name in the console toolbar", () => {
    renderPage();

    expect(screen.getAllByText("diagnosticserviceai")).toHaveLength(2);
    expect(screen.queryByText("local-backend")).not.toBeInTheDocument();
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

  it("keeps incident details collapsed until expanded", async () => {
    const user = userEvent.setup();

    renderPage();

    expect(screen.queryByText(/java.lang.IllegalStateException/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /show incident details/i }));

    expect(screen.getByRole("heading", { name: /incident details/i })).toBeInTheDocument();
    expect(screen.getByText(/java.lang.IllegalStateException/i)).toBeInTheDocument();
    expect(screen.getByText(/boom/i)).toBeInTheDocument();
  });

  it("renders compact status chips and action controls", () => {
    renderPage();

    expect(screen.getByText(/connected/i)).toHaveClass("logs-console-status-chip");
    expect(screen.getByRole("button", { name: /pause live stream/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /clear console/i })).toBeInTheDocument();
  });

  it("keeps the log viewport rendered in light theme", () => {
    document.documentElement.setAttribute("data-theme", "light");

    renderPage();

    expect(screen.getByTestId("logs-console")).toBeInTheDocument();
  });

  it("filters buffered logs by a quick time range", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-11T12:05:00Z"));
    useRealtimeStore.setState({
      ...useRealtimeStore.getState(),
      logs: [
        {
          ts: "2026-04-11T11:40:00Z",
          service: "diagnosticserviceai",
          payload: {
            message: "older line",
            level: "INFO",
            traceId: null
          }
        },
        {
          ts: "2026-04-11T12:00:00Z",
          service: "diagnosticserviceai",
          payload: {
            message: "recent line",
            level: "INFO",
            traceId: null
          }
        }
      ]
    });

    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /^15m$/i }));

    expect(screen.getByText(/recent line/i)).toBeInTheDocument();
    expect(screen.queryByText(/older line/i)).not.toBeInTheDocument();
  });

  it("applies a custom time range after pressing apply", async () => {
    const user = userEvent.setup();
    const from = toDatetimeLocalValue("2026-04-11T11:59:00Z");
    const to = toDatetimeLocalValue("2026-04-11T12:01:00Z");

    renderPage();
    await user.click(screen.getByRole("button", { name: /custom range/i }));
    fireEvent.change(screen.getByLabelText(/^from$/i), { target: { value: from } });
    fireEvent.change(screen.getByLabelText(/^to$/i), { target: { value: to } });
    await user.click(screen.getByRole("button", { name: /^apply$/i }));

    expect(screen.getByText(/user login succeeded/i)).toBeInTheDocument();
  });

  it("shows helper copy that explains time ranges only filter the streamed buffer", () => {
    renderPage();

    expect(
      screen.getByText(/time range filters only the streamed logs already loaded in this session/i)
    ).toBeInTheDocument();
  });

  it("shows the currently active time range summary", async () => {
    const user = userEvent.setup();

    renderPage();

    expect(screen.getByLabelText(/active time range/i)).toHaveTextContent(/all streamed/i);

    await user.click(screen.getByRole("button", { name: /^1h$/i }));

    expect(screen.getByLabelText(/active time range/i)).toHaveTextContent(/showing: 1h/i);
  });

  it("shows a time-range-specific empty state when the selected interval has no lines", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-11T13:00:00Z"));

    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /^5m$/i }));

    expect(screen.getByText(/no logs match the selected time range/i)).toBeInTheDocument();
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

    expect(screen.getByRole("button", { name: /resume live stream/i })).toBeInTheDocument();
  });

  it("opens Gemini diagnosis panel and disables submit without a question", async () => {
    const user = userEvent.setup();

    renderPage();
    await user.click(screen.getByRole("button", { name: /diagnose with gemini/i }));

    expect(screen.getByRole("heading", { name: /ai diagnosis/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /run diagnosis/i })).toBeDisabled();
  });

  it("submits the last visible log lines to Gemini and renders the diagnosis", async () => {
    const user = userEvent.setup();
    useRealtimeStore.setState({
      ...useRealtimeStore.getState(),
      logs: [
        {
          ts: new Date().toISOString(),
          service: "diagnosticserviceai",
          payload: {
            message: "User login succeeded",
            level: "INFO",
            traceId: null
          }
        }
      ]
    });
    vi.mocked(diagnoseLogsWithGemini).mockResolvedValue({
      provider: "google",
      model: "gemini-2.5-flash",
      promptVersion: "v1",
      summary: "Likely an authentication mismatch after login.",
      timeline: ["12:00 login succeeded", "12:01 websocket rejected expired JWT"],
      probableRootCause: "Expired JWT during reconnect",
      evidence: ["JWT expired before reconnect", "socket reused stale token"],
      nextChecks: ["Check JWT expiry.", "Verify websocket reconnect path."],
      rawText: "Detailed response"
    });

    renderPage();
    await user.click(screen.getByRole("button", { name: /diagnose with gemini/i }));
    await user.click(screen.getByRole("button", { name: /^15m$/i }));
    await user.type(screen.getByLabelText(/^question$/i), "Why did this fail?");
    await user.click(screen.getByRole("button", { name: /run diagnosis/i }));

    expect(vi.mocked(diagnoseLogsWithGemini)).toHaveBeenCalledWith({
      mode: "diagnosis",
      service: "diagnosticserviceai",
      question: "Why did this fail?",
      logLines: [expect.stringMatching(/INFO \[diagnosticserviceai] User login succeeded$/)],
      timeRange: {
        mode: "relative",
        label: "Showing: 15m",
        from: null,
        to: null
      },
      levelFilter: "",
      textFilter: ""
    });

    expect(await screen.findByText(/likely an authentication mismatch/i)).toBeInTheDocument();
    expect(screen.getByText(/expired jwt during reconnect/i)).toBeInTheDocument();
    expect(screen.getByText(/12:01 websocket rejected expired jwt/i)).toBeInTheDocument();
    expect(screen.getByText(/check jwt expiry/i)).toBeInTheDocument();
    expect(screen.getByText(/gemini-2.5-flash/i)).toBeInTheDocument();
  });

  it("shows a readable Gemini error inline", async () => {
    const user = userEvent.setup();
    vi.mocked(diagnoseLogsWithGemini).mockRejectedValue(new Error("Provider timeout"));

    renderPage();
    await user.click(screen.getByRole("button", { name: /diagnose with gemini/i }));
    await user.type(screen.getByLabelText(/^question$/i), "What happened?");
    await user.click(screen.getByRole("button", { name: /run diagnosis/i }));

    expect(await screen.findByText(/provider timeout/i)).toBeInTheDocument();
  });
});
