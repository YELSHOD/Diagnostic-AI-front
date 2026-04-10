import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listRuntimeTargets } from "./api";

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
});
