import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth.config";
import { getUsers } from "@/lib/actions/users";
import UsersClient from "./users-client";

export default async function UsersPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const users = await getUsers();
  return <UsersClient users={users} />;
}
