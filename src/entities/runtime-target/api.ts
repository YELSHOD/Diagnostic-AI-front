import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@shared/lib/http";
import type { RuntimeTargetDto } from "./types";

export async function listRuntimeTargets(signal?: AbortSignal) {
  return apiGet<RuntimeTargetDto[]>("/api/runtime-targets", signal);
}

export function useRuntimeTargets() {
  return useQuery({
    queryKey: ["runtime-targets"],
    queryFn: ({ signal }) => listRuntimeTargets(signal),
    refetchInterval: 15_000
  });
}
