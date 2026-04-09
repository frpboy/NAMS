"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  LayoutDashboard,
  ClipboardPlus,
  Building2,
  FlaskConical,
  Users,
  BarChart3,
  History,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/assessment/new", label: "New Assessment", icon: ClipboardPlus },
];

const ADMIN_ITEMS = [
  { href: "/admin/outlets", label: "Outlets", icon: Building2 },
  { href: "/admin/tests", label: "Test Master List", icon: FlaskConical },
  { href: "/admin/diet-plans", label: "Diet Plans", icon: ClipboardPlus }, // Reuse icon or similar
];

const USER_MGMT_ITEMS = [
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/audit", label: "Audit Logs", icon: History },
];

export function SidebarNav({ role, isCollapsed }: { role: string, isCollapsed: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="px-3 space-y-1">
      {NAV_ITEMS.map((item) => (
        <NavLink key={item.href} {...item} active={pathname === item.href} isCollapsed={isCollapsed} />
      ))}

      <div className="pt-4">
        {!isCollapsed && (
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
            System Modules
          </p>
        )}
        {isCollapsed && <div className="mx-3 border-t border-slate-100 my-4" />}
        
        <div className="space-y-1">
          {ADMIN_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              active={pathname.startsWith(item.href)}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      </div>

      {role === "ADMIN" && (
        <div className="pt-4">
          {!isCollapsed && (
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Admin Only
            </p>
          )}
          {isCollapsed && <div className="mx-3 border-t border-slate-100 my-4" />}
          
          <div className="space-y-1">
            {USER_MGMT_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                active={pathname.startsWith(item.href)}
                isCollapsed={isCollapsed}
              />
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  isCollapsed
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  isCollapsed: boolean;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      title={isCollapsed ? label : ""}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 group relative",
        active
          ? "bg-teal-600 text-white shadow-md shadow-teal-100"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
        isCollapsed ? "justify-center px-0" : ""
      )}
    >
      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0",
          active ? "text-white" : "text-slate-400 group-hover:text-slate-600"
        )}
      />
      {!isCollapsed && (
        <span className="truncate">{label}</span>
      )}
      {!isCollapsed && active && (
        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white/60" />
      )}
    </Link>
  );
}
