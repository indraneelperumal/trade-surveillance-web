import { AlertsWorkspace } from "@/features/alerts/components/AlertsWorkspace";

export default async function AlertsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;

  return (
    <AlertsWorkspace
      initialStatus={typeof query.status === "string" ? query.status : "all"}
      initialSeverity={typeof query.severity === "string" ? query.severity : "all"}
      initialOffset={typeof query.offset === "string" ? Number(query.offset) || 0 : 0}
      initialLimit={typeof query.limit === "string" ? Number(query.limit) || 8 : 8}
      initialSelected={typeof query.selected === "string" ? query.selected : undefined}
    />
  );
}
