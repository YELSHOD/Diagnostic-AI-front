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
  chatWithAiAssistant: vi.fn()
}));

import { useRuntimeTargets } from "@entities/runtime-target/api";
import { chatWithAiAssistant } from "@features/ai/api";

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
    vi.mocked(chatWithAiAssistant).mockReset();
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

  it("sends a normal chat request and renders a conversational assistant answer", async () => {
    const user = userEvent.setup();
    vi.mocked(chatWithAiAssistant).mockResolvedValue({
      provider: "gemini",
      model: "gemini-2.5-flash",
      promptVersion: "v1",
      answer: "Change password in the Account page.",
      suggestions: ["How do I open the Account page?"],
      relatedPages: ["Account"],
      rawText: "raw"
    });

    renderPage();
    await user.type(screen.getByLabelText(/question/i), "Where do I change my password?");
    await user.click(screen.getByRole("button", { name: /ask ai assistant/i }));

    expect(vi.mocked(chatWithAiAssistant)).toHaveBeenCalledWith({
      message: "Where do I change my password?",
      history: [],
      context: {
        service: "restaurant-demo",
        logLines: [
          "2026-04-13T11:30:04Z INFO [restaurant-demo] Restaurant accepted orderId=ORD-1 etaMinutes=24",
          "2026-04-13T11:30:08Z INFO [restaurant-demo] Kitchen marked order ready orderId=ORD-1"
        ]
      },
    });

    expect(screen.getByText(/where do i change my password/i)).toBeInTheDocument();
    expect(await screen.findByText(/change password in the account page/i)).toBeInTheDocument();
    expect(screen.getByText(/how do i open the account page/i)).toBeInTheDocument();
  });

  it("sends chat history and keeps the assistant response as plain text", async () => {
    const user = userEvent.setup();
    vi.mocked(chatWithAiAssistant)
      .mockResolvedValueOnce({
        provider: "gemini",
        model: "gemini-2.5-flash",
        promptVersion: "v1",
        answer: "Hello. I can help with the app or with the current logs.",
        suggestions: [],
        relatedPages: [],
        rawText: "raw"
      })
      .mockResolvedValueOnce({
      provider: "gemini",
      model: "gemini-2.5-flash",
      promptVersion: "v1",
        answer: "The order moved from accepted to ready very quickly.",
        suggestions: ["Open Live Logs for restaurant-demo."],
        relatedPages: ["Live Logs"],
        rawText: "raw"
      });

    renderPage();
    await user.type(screen.getByLabelText(/question/i), "Hello");
    await user.click(screen.getByRole("button", { name: /ask ai assistant/i }));
    await user.type(screen.getByLabelText(/question/i), "What happened to this order?");
    await user.click(screen.getByRole("button", { name: /ask ai assistant/i }));

    expect(vi.mocked(chatWithAiAssistant)).toHaveBeenLastCalledWith({
      message: "What happened to this order?",
      history: [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hello. I can help with the app or with the current logs." }
      ],
      context: {
        service: "restaurant-demo",
        logLines: [
          "2026-04-13T11:30:04Z INFO [restaurant-demo] Restaurant accepted orderId=ORD-1 etaMinutes=24",
          "2026-04-13T11:30:08Z INFO [restaurant-demo] Kitchen marked order ready orderId=ORD-1"
        ]
      },
    });

    expect(await screen.findByText(/the order moved from accepted to ready very quickly/i)).toBeInTheDocument();
    expect(screen.queryByText(/probable root cause/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/restaurant-demo/i).length).toBeGreaterThan(0);
  });
});
