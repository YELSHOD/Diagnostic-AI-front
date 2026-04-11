import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRuntimeTarget, deleteRuntimeTarget, listRuntimeTargets, updateRuntimeTarget } from "./api";

describe("runtime target api", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("requests runtime targets from the backend", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response(JSON.stringify([
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
    ]), { status: 200 }));

    const result = await listRuntimeTargets();

    expect(result[0].type).toBe("LOCAL_SERVICE");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/runtime-targets",
      expect.objectContaining({})
    );
  });

  it("creates a local runtime target", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response(JSON.stringify({
      id: "local-front",
      name: "diagnostic-ai-front",
      type: "LOCAL_SERVICE",
      status: "UNKNOWN",
      host: "localhost",
      port: 5173,
      healthUrl: "http://localhost:5173/actuator/health",
      logSourceType: "FILE_TAIL",
      logSourceRef: "/tmp/front.log",
      metadata: {}
    }), { status: 201 }));

    const result = await createRuntimeTarget({
      name: "diagnostic-ai-front",
      host: "localhost",
      port: 5173,
      healthUrl: "http://localhost:5173/actuator/health",
      logSourceType: "FILE_TAIL",
      logSourceRef: "/tmp/front.log",
      enabled: true
    });

    expect(result.id).toBe("local-front");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/runtime-targets",
      expect.objectContaining({
        method: "POST"
      })
    );
  });

  it("updates a local runtime target", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response(JSON.stringify({
      id: "local-front",
      name: "diagnostic-ai-front",
      type: "LOCAL_SERVICE",
      status: "UNKNOWN",
      host: "127.0.0.1",
      port: 5174,
      healthUrl: "http://127.0.0.1:5174/actuator/health",
      logSourceType: "HTTP_INGEST",
      logSourceRef: "front-service",
      metadata: {}
    }), { status: 200 }));

    const result = await updateRuntimeTarget("local-front", {
      name: "diagnostic-ai-front",
      host: "127.0.0.1",
      port: 5174,
      healthUrl: "http://127.0.0.1:5174/actuator/health",
      logSourceType: "HTTP_INGEST",
      logSourceRef: "front-service",
      enabled: true
    });

    expect(result.port).toBe(5174);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/runtime-targets/local-front",
      expect.objectContaining({
        method: "PATCH"
      })
    );
  });

  it("deletes a local runtime target", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response(null, { status: 204 }));

    await deleteRuntimeTarget("local-front");

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/runtime-targets/local-front",
      expect.objectContaining({
        method: "DELETE"
      })
    );
  });
});
