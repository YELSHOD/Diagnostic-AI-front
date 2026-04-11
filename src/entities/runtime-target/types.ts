export type RuntimeTargetDto = {
  id: string;
  name: string;
  type: "DOCKER_CONTAINER" | "LOCAL_SERVICE";
  status: "UP" | "DOWN" | "UNKNOWN" | "DEGRADED";
  host: string | null;
  port: number | null;
  healthUrl: string | null;
  logSourceType: "DOCKER" | "FILE_TAIL" | "HTTP_INGEST";
  logSourceRef: string | null;
  metadata: Record<string, string>;
};

export type UpsertRuntimeTargetRequest = {
  name: string;
  host: string;
  port: number;
  healthUrl: string;
  logSourceType: "FILE_TAIL" | "HTTP_INGEST";
  logSourceRef: string;
  enabled: boolean;
};
