export type ContainerDto = {
  containerId: string;
  name: string;
  image: string;
  status: string;
  created: string;
  labels: Record<string, string>;
};

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

export type AnalyticsResponse = {
  errorsPerMinute: Array<{ bucket: string; count: number }>;
  topExceptionTypes: Array<{ key: string; count: number }>;
  topClusters: Array<{ key: string; count: number }>;
};

export type WsMessage = {
  type: "LOG_LINE" | "ERROR_EVENT" | "CLUSTER_UPDATE";
  ts: string;
  service: string;
  payload: unknown;
};

export type LogLinePayload = {
  message: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG" | null;
  traceId: string | null;
};

export type ErrorEventPayload = {
  service: string;
  eventTime: string;
  traceId: string | null;
  exceptionType: string;
  message: string;
  topFrames: string[];
  stacktrace: string;
  context: string[];
};

export type ClusterUpdatePayload = {
  clusterKey: string;
  count: number;
  newCluster: boolean;
};
