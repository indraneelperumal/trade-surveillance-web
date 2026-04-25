import { apiFetch } from "@/lib/api/client";
import type { Trade } from "@/types/domain";

export function getTrade(tradeId: string) {
  return apiFetch<Trade>(`/api/v1/trades/${tradeId}`);
}
