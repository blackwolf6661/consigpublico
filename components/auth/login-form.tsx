"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { loginAction } from "@/actions/auth";

const inputClass =
  "w-full rounded-xl border-2 border-border bg-secondary px-4 py-3 text-[14px] font-medium text-foreground placeholder:text-muted-foreground outline-none transition-all duration-150 focus:border-foreground/40 focus:bg-background";

interface LoginFormProps {
  initialError?: string | null;
}

export function LoginForm({ initialError }: LoginFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await loginAction(email, password);
      if (result.success) {
        router.push("/");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">

      {/* ── Marca ────────────────────────────────────────────── */}
      <div
        className="flex flex-col items-center gap-3 mb-10 ds-animate-in"
        style={{ "--index": 0 } as React.CSSProperties}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground shadow-[0_6px_0_rgba(0,0,0,0.20)]">
          <span className="text-[14px] font-black tracking-tighter text-background">CC</span>
        </div>
        <div className="text-center">
          <h1 className="text-[26px] font-bold tracking-tight text-foreground leading-tight">
            Carbon Capital
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5 font-medium">
            Sistema ConsigPúblico
          </p>
        </div>
      </div>

      {/* ── Card ─────────────────────────────────────────────── */}
      <div
        className="w-full max-w-[400px] rounded-[20px] border-2 border-border bg-card p-8 shadow-[5px_5px_0_rgba(0,0,0,0.10)] ds-animate-in"
        style={{ "--index": 1 } as React.CSSProperties}
      >
        <div className="mb-7">
          <h2 className="text-[20px] font-bold text-foreground tracking-tight">
            Bem-vindo de volta
          </h2>
          <p className="text-[13px] text-muted-foreground mt-1">
            Insira suas credenciais para acessar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
              E-mail
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              disabled={isPending}
            />
          </div>

          {/* Senha */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(inputClass, "pr-11")}
                disabled={isPending}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Erro */}
          {error && (
            <div className="rounded-xl border-2 border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] font-medium text-destructive">
              {error}
            </div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={isPending}
            className={cn(
              "mt-1 flex w-full items-center justify-center gap-2 rounded-xl",
              "border-2 border-foreground/10 bg-primary px-6 py-3",
              "text-[14px] font-bold text-primary-foreground",
              "shadow-[0_4px_0_rgba(0,0,0,0.20)] transition-all duration-150",
              "hover:translate-y-[4px] hover:shadow-none",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-[0_4px_0_rgba(0,0,0,0.20)]"
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Entrando…
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>
      </div>

      {/* ── Rodapé ───────────────────────────────────────────── */}
      <p
        className="mt-8 text-[11px] text-muted-foreground/60 ds-animate-in"
        style={{ "--index": 2 } as React.CSSProperties}
      >
        Carbon Capital © {new Date().getFullYear()} · Todos os direitos reservados
      </p>
    </div>
  );
}
