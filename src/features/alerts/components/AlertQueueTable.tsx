import { Badge } from "@/components/ui/Badge";
import { Table, Td, Th } from "@/components/ui/Table";
import { formatRelativeDate } from "@/lib/utils";
import type { Alert } from "@/types/domain";
import {
  severityLabel,
  severityVariant,
  statusLabel,
  statusVariant,
} from "@/features/alerts/adapters/alertView";
import { cn } from "@/lib/utils";

type AlertQueueTableProps = {
  alerts: Alert[];
  selectedAlertId?: string;
  onSelect: (alertId: string) => void;
};

export function AlertQueueTable({
  alerts,
  selectedAlertId,
  onSelect,
}: AlertQueueTableProps) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Alert</Th>
          <Th>Symbol</Th>
          <Th>Anomaly Type</Th>
          <Th>Severity</Th>
          <Th>Status</Th>
          <Th>Assignee</Th>
          <Th>Updated</Th>
        </tr>
      </thead>
      <tbody>
        {alerts.map((alert) => (
          <tr
            key={alert.id}
            className={cn(
              "cursor-pointer hover:bg-[var(--color-background-secondary)]",
              selectedAlertId === alert.id && "bg-[#E6F1FB]",
            )}
            onClick={() => onSelect(alert.id)}
          >
            <Td className="mono">{alert.id}</Td>
            <Td className="font-semibold">{alert.symbol}</Td>
            <Td>{alert.anomalyType}</Td>
            <Td>
              <Badge variant={severityVariant(alert.severity)}>
                {severityLabel(alert.severity)}
              </Badge>
            </Td>
            <Td>
              <Badge variant={statusVariant(alert.status)}>
                {statusLabel(alert.status)}
              </Badge>
            </Td>
            <Td className="text-[11px] text-[var(--color-text-secondary)]">
              {alert.assignee ?? "Unassigned"}
            </Td>
            <Td className="text-[11px] text-[var(--color-text-secondary)]">
              {formatRelativeDate(alert.updatedAt)}
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
