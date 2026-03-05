import { useQuery } from "@tanstack/react-query";
import { apiGet, buildQuery } from "@shared/lib/http";
import type { AnalyticsResponse } from "@shared/types/api";

export function useAnalytics(params: { from?: string; to?: string; service?: string }) {
  const query = buildQuery(params);
  return useQuery({
    queryKey: ["analytics", query],
    queryFn: ({ signal }) => apiGet<AnalyticsResponse>(`/api/analytics${query}`, signal)
  });
}
