import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ClusterUpdatePayload, ErrorEventPayload, LogLinePayload } from "@shared/types/api";

export type ClusterLocal = ClusterUpdatePayload & {
  service: string;
  firstSeen: string;
  lastSeen: string;
};

type RealtimeState = {
  connected: boolean;
  selectedContainerId: string;
  logs: Array<{ ts: string; service: string; payload: LogLinePayload }>;
  errors: Array<{ ts: string; service: string; payload: ErrorEventPayload }>;
  clusters: Record<string, ClusterLocal>;
  setConnected: (v: boolean) => void;
  setContainer: (id: string) => void;
  pushLog: (entry: { ts: string; service: string; payload: LogLinePayload }) => void;
  pushError: (entry: { ts: string; service: string; payload: ErrorEventPayload }) => void;
  applyClusterUpdate: (entry: { ts: string; service: string; payload: ClusterUpdatePayload }) => void;
  clearStream: () => void;
};

export const useRealtimeStore = create<RealtimeState>()(
  persist(
    (set) => ({
      connected: false,
      selectedContainerId: "",
      logs: [],
      errors: [],
      clusters: {},
      setConnected: (connected) => set({ connected }),
      setContainer: (selectedContainerId) => set({ selectedContainerId }),
      pushLog: (entry) =>
        set((state) => ({ logs: [...state.logs.slice(-799), entry] })),
      pushError: (entry) =>
        set((state) => ({ errors: [...state.errors.slice(-199), entry] })),
      applyClusterUpdate: (entry) =>
        set((state) => {
          const prev = state.clusters[entry.payload.clusterKey];
          const next = {
            ...entry.payload,
            service: entry.service,
            firstSeen: prev?.firstSeen ?? entry.ts,
            lastSeen: entry.ts
          };
          return { clusters: { ...state.clusters, [entry.payload.clusterKey]: next } };
        }),
      clearStream: () => set({ logs: [], errors: [], clusters: {} })
    }),
    {
      name: "diagnostic-realtime-selection",
      partialize: (state) => ({ selectedContainerId: state.selectedContainerId })
    }
  )
);
