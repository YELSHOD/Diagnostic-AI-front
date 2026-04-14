import { apiRequest } from "@shared/lib/http";

export type AiDiagnosisRequest = {
  mode: "diagnosis" | "product_help";
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

export type AiChatRequest = {
  message: string;
  history: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  context: {
    service: string;
    logLines: string[];
  } | null;
};

export type AiChatResponse = {
  provider: string;
  model: string;
  promptVersion: string;
  answer: string;
  suggestions: string[];
  relatedPages: string[];
  rawText: string;
};

export function diagnoseLogsWithGemini(body: AiDiagnosisRequest) {
  return apiRequest<AiDiagnosisResponse>("/api/ai/diagnose", {
    method: "POST",
    body
  });
}

export function chatWithAiAssistant(body: AiChatRequest) {
  return apiRequest<AiChatResponse>("/api/ai/chat", {
    method: "POST",
    body
  });
}
