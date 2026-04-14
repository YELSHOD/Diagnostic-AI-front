import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRealtimeStore } from "@features/realtime/store";
import { useSettingsStore } from "@features/settings/store";
import { AiChatPage } from "./AiChatPage";

vi.mock("@entities/runtime-target/api", () => ({
  useRuntimeTargets: vi.fn()
}));

vi.mock("@features/ai/api", () => ({
  diagnoseLogsWithGemini: vi.fn()
}));

import { useRuntimeTargets } from "@entities/runtime-target/api";
import { diagnoseLogsWithGemini } from "@features/ai/api";

function renderPage() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <AiChatPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("AiChatPage", () => {
  beforeEach(() => {
    localStorage.clear();
    useSettingsStore.getState().setLocale("en");
    vi.mocked(diagnoseLogsWithGemini).mockReset();
    vi.mocked(useRuntimeTargets).mockReset();
    vi.mocked(useRuntimeTargets).mockReturnValue({
      data: [
        {
          id: "restaurant",
          name: "restaurant-demo",
          type: "LOCAL_SERVICE",
          status: "UNKNOWN",
          host: "localhost",
          port: 8082,
          healthUrl: "",
          logSourceType: "FILE_TAIL",
          logSourceRef: "/tmp/restaurant-demo.log",
          metadata: {}
        }
      ],
      isLoading: false,
      error: null
    } as never);
    useRealtimeStore.setState({
      connected: true,
      selectedContainerId: "restaurant",
      logs: [
        {
          ts: "2026-04-13T11:30:04Z",
          service: "restaurant-demo",
          payload: {
            message: "Restaurant accepted orderId=ORD-1 etaMinutes=24",
            level: "INFO",
            traceId: null
          }
        },
        {
          ts: "2026-04-13T11:30:08Z",
          service: "restaurant-demo",
          payload: {
            message: "Kitchen marked order ready orderId=ORD-1",
            level: "INFO",
            traceId: null
          }
        }
      ],
      errors: [],
      clusters: {}
    });
  });

  it("infers product help mode and renders a user/assistant thread", async () => {
    const user = userEvent.setup();
    vi.mocked(diagnoseLogsWithGemini).mockResolvedValue({
      provider: "gemini",
      model: "gemini-2.5-flash",
      promptVersion: "v1",
      summary: "Change password in the Account page.",
      timeline: ["Open Account", "Submit password form"],
      probableRootCause: "",
      evidence: ["Account page supports password updates."],
      nextChecks: ["Open Account page."],
      rawText: "raw"
    });

    renderPage();
    await user.type(screen.getByLabelText(/question/i), "Where do I change my password?");
    await user.click(screen.getByRole("button", { name: /ask gemini/i }));

    expect(vi.mocked(diagnoseLogsWithGemini)).toHaveBeenCalledWith({
      mode: "product_help",
      service: "",
      question: "Where do I change my password?",
      logLines: [],
      timeRange: {
        mode: "all",
        label: "Showing: All streamed",
        from: null,
        to: null
      },
      levelFilter: "",
      textFilter: ""
    });

    expect(screen.getByText(/where do i change my password/i)).toBeInTheDocument();
    expect(await screen.findByText(/change password in the account page/i)).toBeInTheDocument();
  });

  it("infers diagnosis mode, uses current realtime context, and renders an assistant bubble", async () => {
    const user = userEvent.setup();
    vi.mocked(diagnoseLogsWithGemini).mockResolvedValue({
      provider: "gemini",
      model: "gemini-2.5-flash",
      promptVersion: "v1",
      summary: "The order completed unusually fast.",
      timeline: ["Accepted", "Ready"],
      probableRootCause: "Likely mock or bad status update.",
      evidence: ["ETA was 24 minutes."],
      nextChecks: ["Check order workflow."],
      rawText: "raw"
    });

    renderPage();
    await user.type(screen.getByLabelText(/question/i), "What happened to this order?");
    await user.click(screen.getByRole("button", { name: /ask gemini/i }));

    expect(vi.mocked(diagnoseLogsWithGemini)).toHaveBeenCalledWith({
      mode: "diagnosis",
      service: "restaurant-demo",
      question: "What happened to this order?",
      logLines: [
        "2026-04-13T11:30:04Z INFO [restaurant-demo] Restaurant accepted orderId=ORD-1 etaMinutes=24",
        "2026-04-13T11:30:08Z INFO [restaurant-demo] Kitchen marked order ready orderId=ORD-1"
      ],
      timeRange: {
        mode: "all",
        label: "Showing: All streamed",
        from: null,
        to: null
      },
      levelFilter: "",
      textFilter: ""
    });

    expect(await screen.findByText(/the order completed unusually fast/i)).toBeInTheDocument();
    expect(screen.getByText(/likely mock or bad status update/i)).toBeInTheDocument();
    expect(screen.getAllByText(/restaurant-demo/i).length).toBeGreaterThan(0);
  });
});
