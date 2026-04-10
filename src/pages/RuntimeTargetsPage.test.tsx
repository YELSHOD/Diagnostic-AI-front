import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSettingsStore } from "@features/settings/store";
import { RuntimeTargetsPage } from "./RuntimeTargetsPage";

vi.mock("@entities/runtime-target/api", () => ({
  useRuntimeTargets: vi.fn()
}));

import { useRuntimeTargets } from "@entities/runtime-target/api";

describe("RuntimeTargetsPage", () => {
  beforeEach(() => {
    useSettingsStore.getState().setLocale("en");
    vi.mocked(useRuntimeTargets).mockReset();
  });

  it("renders docker and local runtime targets together", () => {
    vi.mocked(useRuntimeTargets).mockReturnValue({
      data: [
        {
          id: "docker:orders",
          name: "orders",
          type: "DOCKER_CONTAINER",
          status: "UP",
          host: null,
          port: null,
          healthUrl: null,
          logSourceType: "DOCKER",
          logSourceRef: "docker:orders",
          metadata: {}
        },
        {
          id: "local:front",
          name: "diagnostic-ai-front",
          type: "LOCAL_SERVICE",
          status: "UP",
          host: "localhost",
          port: 5173,
          healthUrl: "http://localhost:5173",
          logSourceType: "FILE_TAIL",
          logSourceRef: "/tmp/front.log",
          metadata: {}
        }
      ],
      isLoading: false,
      error: null
    } as never);

    render(
      <MemoryRouter>
        <RuntimeTargetsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("diagnostic-ai-front")).toBeInTheDocument();
    expect(screen.getByText("LOCAL_SERVICE")).toBeInTheDocument();
    expect(screen.getByText("DOCKER_CONTAINER")).toBeInTheDocument();
  });
});
