import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@shared/lib/http";
import type { ContainerDto } from "@shared/types/api";

export function useContainers() {
  return useQuery({
    queryKey: ["containers"],
    queryFn: ({ signal }) => apiGet<ContainerDto[]>("/api/projects", signal),
    refetchInterval: 15_000
  });
}
