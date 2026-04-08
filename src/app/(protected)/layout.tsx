import { auth, signOut } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { SidebarContainer } from "./sidebar-container";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const signOutAction = async () => {
    "use server";
    await signOut({ redirectTo: "/login" });
  };

  return (
    <SidebarContainer session={session} signOutAction={signOutAction}>
      {children}
    </SidebarContainer>
  );
}
