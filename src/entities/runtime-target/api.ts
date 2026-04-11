import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiRequest } from "@shared/lib/http";
import type { RuntimeTargetDto, UpsertRuntimeTargetRequest } from "./types";

export async function listRuntimeTargets(signal?: AbortSignal) {
  return apiGet<RuntimeTargetDto[]>("/api/runtime-targets", signal);
}

export async function createRuntimeTarget(payload: UpsertRuntimeTargetRequest) {
  return apiRequest<RuntimeTargetDto>("/api/runtime-targets", {
    method: "POST",
    body: payload
  });
}

export async function updateRuntimeTarget(id: string, payload: UpsertRuntimeTargetRequest) {
  return apiRequest<RuntimeTargetDto>(`/api/runtime-targets/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: payload
  });
}

export async function deleteRuntimeTarget(id: string) {
  return apiRequest<void>(`/api/runtime-targets/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}

export function useRuntimeTargets() {
  return useQuery({
    queryKey: ["runtime-targets"],
    queryFn: ({ signal }) => listRuntimeTargets(signal),
    refetchInterval: 15_000
  });
}

export function useCreateRuntimeTarget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRuntimeTarget,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["runtime-targets"] });
    }
  });
}

export function useUpdateRuntimeTarget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpsertRuntimeTargetRequest }) =>
      updateRuntimeTarget(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["runtime-targets"] });
    }
  });
}

export function useDeleteRuntimeTarget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRuntimeTarget,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["runtime-targets"] });
    }
  });
}
