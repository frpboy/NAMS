import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getOutletsPage } from "@/lib/actions/outlets";
import OutletsClient from "./outlets-client";

const PAGE_SIZE = 10;

export default async function OutletsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const resolvedSearchParams = await searchParams;
  const currentPage = Math.max(1, Number.parseInt(resolvedSearchParams?.page ?? "1", 10) || 1);
  const { outlets, total } = await getOutletsPage(currentPage, PAGE_SIZE);

  return (
    <OutletsClient
      outlets={outlets}
      page={currentPage}
      pageSize={PAGE_SIZE}
      total={total}
    />
  );
}
