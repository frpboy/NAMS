"use client";

import { useEffect, useState } from "react";
import { SidebarNav } from "./sidebar-nav";
import { cn } from "@/lib/cn";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";

type SidebarContainerProps = {
  session: {
    user: {
      name?: string | null;
      role: string;
    };
  };
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
};

export function SidebarContainer({ session, signOutAction, children }: SidebarContainerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mediaQuery.matches);

    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  const sidebarCollapsed = isMobile ? true : isCollapsed;

  const initials = (session.user.name ?? "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen w-full bg-[#f8fafc]">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 z-50",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo area */}
        <div className="flex h-16 shrink-0 items-center border-b border-slate-100 px-4 justify-between relative">
          {!sidebarCollapsed && (
            <img src="/logo.svg" alt="NAMS" className="h-7 w-auto transition-opacity duration-300" />
          )}
          {sidebarCollapsed && (
             <img src="/logo-icon.svg" alt="N" className="h-8 w-8 mx-auto" />
          )}
          
          {!isMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-transform z-10"
            >
              {sidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto pt-4">
           <SidebarNav role={session.user.role} isCollapsed={sidebarCollapsed} />
        </div>

        {/* User footer */}
        <div className="shrink-0 border-t border-slate-100 p-3 bg-slate-50/50">
          <div className={cn("flex items-center gap-3 rounded-xl px-2 py-2 transition-all", sidebarCollapsed ? "justify-center" : "")}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-600 text-[13px] font-bold text-white shadow-sm">
              {initials}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {session.user.name}
                </p>
                <p className="text-[11px] font-medium uppercase tracking-wider text-teal-600">
                  {session.user.role}
                </p>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => signOutAction()}
            className={cn(
              "mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600",
              sidebarCollapsed ? "justify-center" : ""
            )}
          >
            <LogOut className="h-4 w-4" />
            {!sidebarCollapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 min-w-0 transition-all duration-300",
        sidebarCollapsed ? "pl-16" : "pl-64"
      )}>
        <div className="mx-auto max-w-[1600px] p-3 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
