import { listAlerts } from "@/lib/api/endpoints/alerts";
import { listTrades } from "@/lib/api/endpoints/trades";
import { queryKeys } from "@/lib/api/queryKeys";
import type { Alert, Investigation, Trade } from "@/types/domain";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export type InvestigationListItem = {
  investigation: Investigation;
  alert: Alert | null;
  trade: Trade | null;
};

type Options = {
  enabled: boolean;
  investigations: Investigation[];
};

export function useInvestigationListContext({ enabled, investigations }: Options) {
  const alertsQuery = useQuery({
    queryKey: queryKeys.alerts.list({ offset: 0, limit: 200 }),
    queryFn: () => listAlerts({ offset: 0, limit: 200 }),
    enabled,
    staleTime: 30_000,
  });

  const tradesQuery = useQuery({
    queryKey: queryKeys.trades.list({ offset: 0, limit: 200 }),
    queryFn: () => listTrades({ offset: 0, limit: 200 }),
    enabled,
    staleTime: 30_000,
  });

  const items = useMemo(() => {
    const alertById = new Map<string, Alert>();
    for (const alert of alertsQuery.data?.items ?? []) {
      alertById.set(alert.id, alert);
    }

    const tradeById = new Map<string, Trade>();
    for (const trade of tradesQuery.data?.items ?? []) {
      tradeById.set(trade.id, trade);
    }

    return investigations.map((investigation): InvestigationListItem => {
      const alert = alertById.get(investigation.alertId) ?? null;
      const trade = alert?.tradeId ? tradeById.get(alert.tradeId) ?? null : null;
      return { investigation, alert, trade };
    });
  }, [alertsQuery.data?.items, tradesQuery.data?.items, investigations]);

  const isLoadingContext = alertsQuery.isPending || tradesQuery.isPending;

  return { items, isLoadingContext };
}
