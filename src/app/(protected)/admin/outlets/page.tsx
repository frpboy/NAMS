import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getOutlets } from "@/lib/actions/outlets";
import OutletsClient from "./outlets-client";

export default async function OutletsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const outlets = await getOutlets();
  return <OutletsClient outlets={outlets} />;
}
