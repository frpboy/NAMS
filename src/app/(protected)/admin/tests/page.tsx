import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getMasterTestsPage } from "@/lib/actions/master-tests";
import TestsClient from "./tests-client";

const PAGE_SIZE = 20;

export default async function TestsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const resolvedSearchParams = await searchParams;
  const currentPage = Math.max(1, Number.parseInt(resolvedSearchParams?.page ?? "1", 10) || 1);
  const { tests, total } = await getMasterTestsPage(currentPage, PAGE_SIZE);

  return (
    <TestsClient
      tests={tests}
      page={currentPage}
      pageSize={PAGE_SIZE}
      total={total}
    />
  );
}
