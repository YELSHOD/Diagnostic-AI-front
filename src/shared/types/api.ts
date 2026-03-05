export type ContainerDto = {
  containerId: string;
  name: string;
  image: string;
  status: string;
  created: string;
  labels: Record<string, string>;
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
