import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRealtimeStore } from "@features/realtime/store";
import { useSettingsStore } from "@features/settings/store";
import { AnalysisPage } from "./AnalysisPage";

vi.mock("@entities/runtime-target/api", () => ({
  useRuntimeTargets: vi.fn()
}));

import { useRuntimeTargets } from "@entities/runtime-target/api";

function renderPage() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <AnalysisPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("AnalysisPage", () => {
  beforeEach(() => {
    localStorage.clear();
    useSettingsStore.getState().setLocale("en");
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
      ...useRealtimeStore.getState(),
      selectedContainerId: "restaurant",
      clusters: {
        "cluster-1": {
          clusterKey: "cluster-1",
          service: "restaurant-demo",
          count: 3,
          newCluster: true,
          firstSeen: "2026-04-14T06:00:00Z",
          lastSeen: "2026-04-14T06:10:00Z"
        }
      }
    });
  });

  it("shows the selected runtime target as the current analysis context", () => {
    renderPage();

    expect(screen.getByText(/current target/i)).toBeInTheDocument();
    expect(screen.getAllByText(/restaurant-demo/i).length).toBeGreaterThan(0);
  });
});
