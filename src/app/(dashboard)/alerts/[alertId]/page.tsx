import { redirect } from "next/navigation";

export default async function AlertLegacyRedirect({
  params,
}: {
  params: Promise<{ alertId: string }>;
}) {
  const { alertId } = await params;
  redirect(`/cases/${alertId}`);
}
