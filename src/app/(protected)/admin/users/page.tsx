import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getUsersPage } from "@/lib/actions/users";
import UsersClient from "./users-client";

const PAGE_SIZE = 10;

export default async function UsersPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const resolvedSearchParams = await searchParams;
  const currentPage = Math.max(1, Number.parseInt(resolvedSearchParams?.page ?? "1", 10) || 1);

  let users: Awaited<ReturnType<typeof getUsersPage>>["users"] = [];
  let total = 0;
  let dbError: string | null = null;

  try {
    const result = await getUsersPage(currentPage, PAGE_SIZE);
    users = result.users;
    total = result.total;
  } catch (error) {
    console.error("UsersPage database error:", error);
    dbError = "User records are temporarily unavailable. Please retry in a moment.";
  }

  return (
    <UsersClient
      users={users}
      page={currentPage}
      pageSize={PAGE_SIZE}
      total={total}
      dbError={dbError}
    />
  );
}
