import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth.config";
import { getMasterTests } from "@/lib/actions/master-tests";
import TestsClient from "./tests-client";

export const dynamic = "force-dynamic";

export default async function TestsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const tests = await getMasterTests();
  return <TestsClient tests={tests} />;
}
