import { useEffect, useRef } from "react";
import { parseWsMessage, runtimeWsBaseUrl } from "@shared/lib/ws";
import { useRealtimeStore } from "@features/realtime/store";

type Opts = {
  containerId: string;
  wsBaseUrl?: string;
  reconnectMinMs?: number;
  reconnectMaxMs?: number;
};

export function useLogsSocket({ containerId, wsBaseUrl, reconnectMinMs = 800, reconnectMaxMs = 10000 }: Opts) {
  const setConnected = useRealtimeStore((s) => s.setConnected);
  const pushLog = useRealtimeStore((s) => s.pushLog);
  const pushError = useRealtimeStore((s) => s.pushError);
  const applyClusterUpdate = useRealtimeStore((s) => s.applyClusterUpdate);

  const attempts = useRef(0);

  useEffect(() => {
    if (!containerId) return;
    let active = true;
    let socket: WebSocket | null = null;
    let timer: number | null = null;

    const connect = () => {
      if (!active) return;
      const base = wsBaseUrl ?? runtimeWsBaseUrl();
      socket = new WebSocket(`${base}/ws/logs?containerId=${encodeURIComponent(containerId)}`);

      socket.onopen = () => {
        attempts.current = 0;
        setConnected(true);
      };

      socket.onmessage = (e) => {
        const parsed = parseWsMessage(String(e.data));
        if (parsed.kind !== "ok") return;
        const msg = parsed.data;

        if (msg.type === "LOG_LINE") {
          pushLog({ ts: msg.ts, service: msg.service, payload: msg.payload as any });
        } else if (msg.type === "ERROR_EVENT") {
          pushError({ ts: msg.ts, service: msg.service, payload: msg.payload as any });
        } else if (msg.type === "CLUSTER_UPDATE") {
          applyClusterUpdate({ ts: msg.ts, service: msg.service, payload: msg.payload as any });
        }
      };

      socket.onclose = () => {
        setConnected(false);
        if (!active) return;
        attempts.current += 1;
        const baseDelay = Math.min(reconnectMaxMs, reconnectMinMs * 2 ** attempts.current);
        const jitter = Math.floor(Math.random() * 250);
        timer = window.setTimeout(connect, baseDelay + jitter);
      };

      socket.onerror = () => socket?.close();
    };

    connect();

    return () => {
      active = false;
      setConnected(false);
      if (timer !== null) window.clearTimeout(timer);
      socket?.close();
    };
  }, [containerId, wsBaseUrl, reconnectMinMs, reconnectMaxMs, setConnected, pushLog, pushError, applyClusterUpdate]);
}
