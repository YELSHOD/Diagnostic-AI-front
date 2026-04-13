import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSettingsStore } from "@features/settings/store";
import { OverviewPage } from "./OverviewPage";

vi.mock("@entities/analytics/api", () => ({
  useAnalytics: vi.fn()
}));

vi.mock("@entities/runtime-target/api", () => ({
  useRuntimeTargets: vi.fn()
}));

vi.mock("@widgets/LineChart", () => ({
  LineChart: ({ title }: { title: string }) => <div>{title}</div>
}));

import { useAnalytics } from "@entities/analytics/api";
import { useRuntimeTargets } from "@entities/runtime-target/api";

function renderPage() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <OverviewPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("OverviewPage", () => {
  beforeEach(() => {
    localStorage.clear();
    useSettingsStore.getState().setLocale("en");
    vi.mocked(useAnalytics).mockReset();
    vi.mocked(useRuntimeTargets).mockReset();

    vi.mocked(useAnalytics).mockReturnValue({
      data: {
        errorsPerMinute: [],
        topExceptionTypes: [
          { key: "java.net.SocketException", count: 28 }
        ],
        topClusters: [
          {
            key: "java.net.SocketException|io-frame|at org.apache.tomcat.websocket.WsRemoteEndpointImplBase.sendMessageBlock",
            count: 12
          }
        ]
      },
      isLoading: false,
      error: null
    } as never);

    vi.mocked(useRuntimeTargets).mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    } as never);
  });

  it("renders analytics table keys inside overflow-safe cells", () => {
    const { container } = renderPage();

    expect(screen.getAllByText(/java.net.SocketException/i).length).toBeGreaterThan(0);
    expect(container.querySelectorAll(".analytics-key-cell").length).toBeGreaterThan(0);
  });
});
