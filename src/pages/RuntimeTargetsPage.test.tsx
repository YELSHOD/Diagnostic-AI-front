import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSettingsStore } from "@features/settings/store";
import { RuntimeTargetsPage } from "./RuntimeTargetsPage";

vi.mock("@entities/runtime-target/api", () => ({
  useRuntimeTargets: vi.fn(),
  useCreateRuntimeTarget: vi.fn(),
  useDeleteRuntimeTarget: vi.fn(),
  useUpdateRuntimeTarget: vi.fn()
}));

import {
  useCreateRuntimeTarget,
  useDeleteRuntimeTarget,
  useRuntimeTargets,
  useUpdateRuntimeTarget
} from "@entities/runtime-target/api";

describe("RuntimeTargetsPage", () => {
  beforeEach(() => {
    useSettingsStore.getState().setLocale("en");
    vi.mocked(useRuntimeTargets).mockReset();
    vi.mocked(useCreateRuntimeTarget).mockReset();
    vi.mocked(useDeleteRuntimeTarget).mockReset();
    vi.mocked(useUpdateRuntimeTarget).mockReset();
    vi.mocked(useCreateRuntimeTarget).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false
    } as never);
    vi.mocked(useDeleteRuntimeTarget).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false
    } as never);
    vi.mocked(useUpdateRuntimeTarget).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false
    } as never);
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

    expect(screen.getByRole("heading", { name: "Runtime targets" })).toBeInTheDocument();
    expect(screen.getByText("diagnostic-ai-front")).toBeInTheDocument();
    expect(screen.getByText("LOCAL_SERVICE")).toBeInTheDocument();
    expect(screen.getByText("DOCKER_CONTAINER")).toBeInTheDocument();
  });

  it("shows add form and creates a local runtime target", async () => {
    const createMutation = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useRuntimeTargets).mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    } as never);
    vi.mocked(useCreateRuntimeTarget).mockReturnValue({
      mutateAsync: createMutation,
      isPending: false
    } as never);

    render(
      <MemoryRouter>
        <RuntimeTargetsPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Add local service" }));
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "diagnostic-ai-front" } });
    fireEvent.change(screen.getByLabelText("Host"), { target: { value: "localhost" } });
    fireEvent.change(screen.getByLabelText("Port"), { target: { value: "5173" } });
    fireEvent.change(screen.getByLabelText("Health URL"), { target: { value: "http://localhost:5173/actuator/health" } });
    fireEvent.change(screen.getByLabelText("Log source"), { target: { value: "FILE_TAIL" } });
    fireEvent.change(screen.getByLabelText("Log reference"), { target: { value: "/tmp/front.log" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save local service" }));
    });

    await waitFor(() => {
      expect(createMutation).toHaveBeenCalledWith({
        name: "diagnostic-ai-front",
        host: "localhost",
        port: 5173,
        healthUrl: "http://localhost:5173/actuator/health",
        logSourceType: "FILE_TAIL",
        logSourceRef: "/tmp/front.log",
        enabled: true
      });
    });
  });

  it("opens edit form and updates a local runtime target", async () => {
    const updateMutation = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useRuntimeTargets).mockReturnValue({
      data: [
        {
          id: "local-front",
          name: "diagnostic-ai-front",
          type: "LOCAL_SERVICE",
          status: "UP",
          host: "localhost",
          port: 5173,
          healthUrl: "http://localhost:5173/actuator/health",
          logSourceType: "FILE_TAIL",
          logSourceRef: "/tmp/front.log",
          metadata: {}
        }
      ],
      isLoading: false,
      error: null
    } as never);
    vi.mocked(useUpdateRuntimeTarget).mockReturnValue({
      mutateAsync: updateMutation,
      isPending: false
    } as never);

    render(
      <MemoryRouter>
        <RuntimeTargetsPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Port"), { target: { value: "5174" } });
    fireEvent.change(screen.getByLabelText("Log source"), { target: { value: "HTTP_INGEST" } });
    fireEvent.change(screen.getByLabelText("Log reference"), { target: { value: "front-service" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    });

    await waitFor(() => {
      expect(updateMutation).toHaveBeenCalledWith({
        id: "local-front",
        payload: {
          name: "diagnostic-ai-front",
          host: "localhost",
          port: 5174,
          healthUrl: "http://localhost:5173/actuator/health",
          logSourceType: "HTTP_INGEST",
          logSourceRef: "front-service",
          enabled: true
        }
      });
    });
  });

  it("deletes a local runtime target", async () => {
    const deleteMutation = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useRuntimeTargets).mockReturnValue({
      data: [
        {
          id: "local-front",
          name: "diagnostic-ai-front",
          type: "LOCAL_SERVICE",
          status: "UP",
          host: "localhost",
          port: 5173,
          healthUrl: "http://localhost:5173/actuator/health",
          logSourceType: "FILE_TAIL",
          logSourceRef: "/tmp/front.log",
          metadata: {}
        }
      ],
      isLoading: false,
      error: null
    } as never);
    vi.mocked(useDeleteRuntimeTarget).mockReturnValue({
      mutateAsync: deleteMutation,
      isPending: false
    } as never);

    render(
      <MemoryRouter>
        <RuntimeTargetsPage />
      </MemoryRouter>
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    });

    await waitFor(() => {
      expect(deleteMutation).toHaveBeenCalledWith("local-front");
    });
  });
});
