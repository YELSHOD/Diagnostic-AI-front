import { apiRequest } from "@shared/lib/http";

export type AiDiagnosisRequest = {
  service: string;
  question: string;
  logLines: string[];
  timeRange: {
    mode: "all" | "relative" | "custom";
    label: string;
    from: string | null;
    to: string | null;
  };
  levelFilter: string;
  textFilter: string;
};

export type AiDiagnosisResponse = {
  provider: string;
  model: string;
  promptVersion: string;
  summary: string;
  timeline: string[];
  probableRootCause: string;
  evidence: string[];
  nextChecks: string[];
  rawText: string;
};

export function diagnoseLogsWithGemini(body: AiDiagnosisRequest) {
  return apiRequest<AiDiagnosisResponse>("/api/ai/diagnose", {
    method: "POST",
    body
  });
}
