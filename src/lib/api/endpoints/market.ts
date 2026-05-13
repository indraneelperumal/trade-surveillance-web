import { apiFetch } from "@/lib/api/client";

export type MarketPrice = {
  symbol: string;
  price: number | null;
  change: number;
  changePct: number;
};

export function getMarketPrices(): Promise<MarketPrice[]> {
  return apiFetch<MarketPrice[]>("/api/v1/market/prices");
}
