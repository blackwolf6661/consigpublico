"use client";

import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useState, useRef, useEffect, useTransition } from "react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth";

interface TopbarProps {
  nome?: string;
}

export function Topbar({ nome = "Admin" }: TopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = nome
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  function handleLogout() {
    setDropdownOpen(false);
    startTransition(async () => {
      await logoutAction();
    });
  }

  return (
    <header className="flex items-center justify-between px-8 pt-8 pb-7">
      {/* ── Left: Brand ─────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-foreground shadow-[0_4px_0_rgba(0,0,0,0.25)]">
          <span className="text-[12px] font-black tracking-tighter text-background">CC</span>
        </div>
        <span className="text-[22px] font-bold tracking-tight text-foreground">
          Carbon Capital
        </span>
      </div>

      {/* ── Right: Avatar dropdown ───────────────────────────── */}
      <div className="relative" ref={dropdownRef}>
        <button
          className={cn(
            "flex items-center gap-2 rounded-full border-2 border-border bg-transparent",
            "pl-1.5 pr-3.5 h-11 transition-all duration-150",
            "shadow-[0_4px_0_rgba(0,0,0,0.12)]",
            "hover:translate-y-[4px] hover:shadow-none hover:border-foreground/25",
            dropdownOpen && "translate-y-[4px] shadow-none border-foreground/25"
          )}
          onClick={() => setDropdownOpen((o) => !o)}
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground">
            {initials}
          </div>
          <span className="hidden sm:block text-[13px] font-semibold text-foreground max-w-[140px] truncate">
            {nome}
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
              dropdownOpen && "rotate-180"
            )}
          />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border-2 border-border bg-card shadow-[4px_4px_0_rgba(0,0,0,0.10)] overflow-hidden z-50">
            <div className="border-b-2 border-border px-4 py-3">
              <p className="text-[13px] font-semibold text-foreground truncate">{nome}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Administrador</p>
            </div>

            <button
              className="flex w-full items-center gap-2.5 px-4 py-3 text-[14px] font-medium text-foreground transition-colors duration-150 hover:bg-secondary"
              onClick={() => setDropdownOpen(false)}
            >
              <User className="h-3.5 w-3.5 flex-shrink-0 opacity-70" />
              Meu Perfil
            </button>

            <button
              className="flex w-full items-center gap-2.5 px-4 py-3 text-[14px] font-medium text-foreground transition-colors duration-150 hover:bg-secondary"
              onClick={() => setDropdownOpen(false)}
            >
              <Settings className="h-3.5 w-3.5 flex-shrink-0 opacity-70" />
              Configurações
            </button>

            <button
              className="flex w-full items-center gap-2.5 px-4 py-3 text-[14px] font-medium border-t-2 border-border text-destructive transition-colors duration-150 hover:bg-destructive/5"
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5 flex-shrink-0 opacity-70" />
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
