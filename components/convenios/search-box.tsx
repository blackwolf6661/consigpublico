"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBoxProps {
  defaultValue?: string;
  placeholder?: string;
}

export function SearchBox({
  defaultValue = "",
  placeholder = "Buscar em todos os campos…",
}: SearchBoxProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sincronizar com URL (ex: voltar do histórico)
  useEffect(() => {
    setValue(searchParams.get("search") ?? "");
  }, [searchParams]);

  function push(term: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    params.delete("page"); // resetar paginação
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setValue(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => push(v), 400);
  }

  function handleClear() {
    setValue("");
    push("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") handleClear();
    if (e.key === "Enter") {
      if (timerRef.current) clearTimeout(timerRef.current);
      push(value);
    }
  }

  return (
    <div className="relative flex items-center">
      <Search
        className={cn(
          "pointer-events-none absolute left-3 h-3.5 w-3.5 transition-colors",
          value ? "text-primary" : "text-muted-foreground/50"
        )}
      />
      <input
        type="search"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className={cn(
          "h-9 w-72 rounded-xl border-2 bg-card pl-8 pr-8 text-sm text-foreground placeholder:text-muted-foreground/50",
          "transition-all outline-none",
          "focus:border-primary/60 focus:ring-2 focus:ring-primary/15 focus:w-96",
          value
            ? "border-primary/40 bg-primary/5"
            : "border-border hover:border-border/80"
        )}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-muted-foreground/20 text-muted-foreground transition-colors hover:bg-muted-foreground/30"
          aria-label="Limpar busca"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </div>
  );
}
