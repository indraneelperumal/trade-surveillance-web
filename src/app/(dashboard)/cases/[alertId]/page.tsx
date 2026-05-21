import { CasePage } from "@/features/cases/CasePage";

export default async function Page({
  params,
}: {
  params: Promise<{ alertId: string }>;
}) {
  const { alertId } = await params;
  return <CasePage alertId={alertId} />;
}
