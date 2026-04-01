"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  Settings,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/",          label: "Dashboard",  icon: LayoutDashboard, exact: true  },
  { href: "/convenios", label: "Convênios",  icon: FileText,        exact: false },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-sidebar shadow-2xl backdrop-blur-xl">

      {/* ── Logo — matching nav-logo area ─────────────────── */}
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/30">
          <TrendingUp className="h-[18px] w-[18px] text-primary-foreground" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-[13px] font-bold tracking-tight text-sidebar-foreground truncate">
            Carbon Capital
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/35 truncate">
            Convênios Públicos
          </span>
        </div>
      </div>

      {/* ── Navigation ────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">

        {/* Section label — Menu */}
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
          Menu
        </p>

        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    // Base — .tab-link / .dd-link pattern
                    "group flex items-center justify-between rounded-lg px-3 py-2.5 text-[13px] font-medium",
                    "transition-all duration-200",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-white/60 hover:bg-white/[0.06] hover:text-white/90"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={cn(
                        "h-[15px] w-[15px] shrink-0 transition-colors duration-200",
                        active
                          ? "text-primary"
                          : "text-white/40 group-hover:text-white/70"
                      )}
                    />
                    {item.label}
                  </div>
                  {active && (
                    <ChevronRight className="h-3.5 w-3.5 text-primary" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Section label — Sistema */}
        <p className="mb-2 mt-6 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
          Sistema
        </p>
        <ul className="space-y-0.5">
          <li>
            <button
              disabled
              className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-white/20"
            >
              <Settings className="h-[15px] w-[15px] shrink-0" />
              Configurações
            </button>
          </li>
        </ul>
      </nav>

      {/* ── Footer ────────────────────────────────────────── */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-white/[0.05] px-3 py-2.5 transition-colors hover:bg-white/[0.08]">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/25 text-primary">
            <TrendingUp className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-[12px] font-medium text-sidebar-foreground">Carbon Capital</p>
            <p className="truncate text-[10px] text-white/35">Gestão de Convênios</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
