import { redirect } from "next/navigation";
import { CHALLENGES } from "@/lib/challenges";

export function generateStaticParams() {
  return CHALLENGES.map((challenge) => ({ id: challenge.id }));
}

export default async function DarePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/challenges/${id}`);
}
