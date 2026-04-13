import { apiRequest } from "@shared/lib/http";

export type AiDiagnosisRequest = {
  service: string;
  question: string;
  logLines: string[];
};

export type AiDiagnosisResponse = {
  provider: string;
  model: string;
  promptVersion: string;
  summary: string;
  bullets: string[];
  rawText: string;
};

export function diagnoseLogsWithGemini(body: AiDiagnosisRequest) {
  return apiRequest<AiDiagnosisResponse>("/api/ai/diagnose", {
    method: "POST",
    body
  });
}
