import { auth } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/auth/auth.config";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-60 border-r border-border bg-white">
        <div className="flex h-14 items-center border-b border-border px-5">
          <span className="text-lg font-bold text-primary">NAMS</span>
        </div>

        <nav className="space-y-0.5 p-3">
          <SidebarLink href="/" label="Dashboard" />
          <SidebarLink href="/assessment/new" label="New Assessment" />

          {session.user.role === "ADMIN" && (
            <>
              <div className="my-3 border-t border-border" />
              <p className="px-3 pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Admin
              </p>
              <SidebarLink href="/admin/outlets" label="Outlets" />
              <SidebarLink href="/admin/tests" label="Test Master List" />
              <SidebarLink href="/admin/users" label="Users" />
            </>
          )}
        </nav>

        {/* User info + logout */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-3">
          <div className="mb-2">
            <p className="text-sm font-medium truncate">{session.user.name}</p>
            <p className="text-xs text-muted-foreground">{session.user.role}</p>
          </div>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
            <button className="w-full rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted">
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-60 flex-1">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

function SidebarLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
    >
      {label}
    </Link>
  );
}
