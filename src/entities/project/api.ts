import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiRequest } from "@shared/lib/http";

export type IngestProjectDto = {
  id: string;
  name: string;
  projectKey: string;
  createdAt: string;
};

export async function listIngestProjects(signal?: AbortSignal) {
  return apiGet<IngestProjectDto[]>("/api/ingest-projects", signal);
}

export async function createIngestProject(name: string) {
  return apiRequest<IngestProjectDto>("/api/ingest-projects", {
    method: "POST",
    body: { name }
  });
}

export async function getDefaultIngestProject(signal?: AbortSignal) {
  return apiGet<IngestProjectDto>("/api/ingest-projects/default", signal);
}

export async function generateDefaultIngestProject() {
  return apiRequest<IngestProjectDto>("/api/ingest-projects/default", {
    method: "POST"
  });
}

export function useIngestProjects() {
  return useQuery({
    queryKey: ["ingest-projects"],
    queryFn: ({ signal }) => listIngestProjects(signal)
  });
}

export function useDefaultIngestProject() {
  return useQuery({
    queryKey: ["ingest-projects", "default"],
    queryFn: ({ signal }) => getDefaultIngestProject(signal)
  });
}

export function useGenerateDefaultIngestProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateDefaultIngestProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["ingest-projects"] });
      await queryClient.invalidateQueries({ queryKey: ["ingest-projects", "default"] });
    }
  });
}

export function useCreateIngestProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIngestProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["ingest-projects"] });
      await queryClient.invalidateQueries({ queryKey: ["runtime-targets"] });
    }
  });
}
