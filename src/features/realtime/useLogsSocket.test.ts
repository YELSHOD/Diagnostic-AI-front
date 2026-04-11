import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useLogsSocket } from "@features/realtime/useLogsSocket";
import { useAuthStore } from "@features/auth/store";

class MockWebSocket {
  static instances: MockWebSocket[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  url: string;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  close() {}
}

describe("useLogsSocket", () => {
  const originalWebSocket = globalThis.WebSocket;

  beforeEach(() => {
    MockWebSocket.instances = [];
    // @ts-expect-error test override
    globalThis.WebSocket = MockWebSocket;
    useAuthStore.getState().clearSession();
    useAuthStore.getState().setSession({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      currentUser: {
        id: "user-1",
        email: "user@example.com",
        username: "dev.user",
        status: "ACTIVE",
        roles: ["BACKEND"]
      }
    });
  });

  afterEach(() => {
    globalThis.WebSocket = originalWebSocket;
  });

  it("includes jwt token in websocket url", () => {
    renderHook(() => useLogsSocket({
      runtimeTargetId: "orders",
      wsBaseUrl: "ws://localhost:8080"
    }));

    expect(MockWebSocket.instances[0]?.url).toContain("token=access-token");
    expect(MockWebSocket.instances[0]?.url).toContain("runtimeTargetId=orders");
  });
});
