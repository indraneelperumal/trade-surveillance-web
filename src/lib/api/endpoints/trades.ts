import { normalizeTrade } from "@/lib/api/adapters/normalizeDomain";
import { apiFetch } from "@/lib/api/client";
import type { ListQuery, PaginatedResponse } from "@/types/api";
import type { Trade } from "@/types/domain";

export type TradeListQuery = ListQuery & {
  symbol?: string;
};

export function listTrades(query: TradeListQuery = {}) {
  return apiFetch<PaginatedResponse<Record<string, unknown>>>("/api/v1/trades", { query }).then(
    (res) => ({
      ...res,
      items: res.items.map((row) => normalizeTrade(row)),
    }),
  ) as Promise<PaginatedResponse<Trade>>;
}

export function getTrade(tradeId: string) {
  return apiFetch<Record<string, unknown>>(`/api/v1/trades/${tradeId}`).then((row) =>
    normalizeTrade(row),
  );
}
