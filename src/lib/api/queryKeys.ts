export const queryKeys = {
  alerts: {
    list: (params: Record<string, string | number>) => ["alerts", params] as const,
    detail: (alertId: string) => ["alerts", "detail", alertId] as const,
  },
  notes: {
    list: (params: Record<string, string | number>) => ["notes", params] as const,
  },
  investigations: {
    list: (params: Record<string, string | number>) =>
      ["investigations", params] as const,
    detail: (investigationId: string) =>
      ["investigations", "detail", investigationId] as const,
  },
  users: {
    list: (params: Record<string, string | number>) => ["users", params] as const,
  },
  trades: {
    list: (params: Record<string, string | number>) => ["trades", params] as const,
    detail: (tradeId: string) => ["trades", "detail", tradeId] as const,
  },
  metrics: {
    overview: () => ["metrics", "overview"] as const,
  },
};
