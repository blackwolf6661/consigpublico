"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Check, ChevronDown, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { criarParceiro, type ParceiroRow } from "@/actions/convenios";

interface ParceiroComboboxProps {
  parceiros: ParceiroRow[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function ParceiroCombobox({
  parceiros: initialParceiros,
  value,
  onChange,
  error,
}: ParceiroComboboxProps) {
  const [open, setOpen] = useState(false);
  const [parceiros, setParceiros] = useState(initialParceiros);
  const [search, setSearch] = useState("");
  const [addMode, setAddMode] = useState(false);
  const [novoLabel, setNovoLabel] = useState("");
  const [isPending, startTransition] = useTransition();
  const [addError, setAddError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setAddMode(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (addMode) addInputRef.current?.focus();
  }, [addMode]);

  const filtered = parceiros.filter((p) =>
    p.label.toLowerCase().includes(search.toLowerCase())
  );

  const selected = parceiros.find((p) => p.nome === value);

  function handleSelect(nome: string) {
    onChange(nome === value ? "" : nome);
    setOpen(false);
    setSearch("");
    setAddMode(false);
  }

  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!novoLabel.trim()) return;
    setAddError(null);

    startTransition(async () => {
      const result = await criarParceiro(novoLabel);
      if (result.success) {
        setParceiros((prev) => [...prev, result.data]);
        onChange(result.data.nome);
        setNovoLabel("");
        setAddMode(false);
        setOpen(false);
      } else {
        setAddError(result.error);
      }
    });
  }

  const triggerClass = cn(
    "w-full flex items-center justify-between gap-2",
    "rounded-lg border border-border bg-secondary/40 px-3 py-2",
    "text-sm transition-colors cursor-pointer",
    "focus:border-primary/50 focus:bg-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/20",
    open && "border-primary/50 bg-secondary/60 ring-2 ring-primary/20",
    error && "border-destructive/50"
  );

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger */}
      <button
        type="button"
        className={triggerClass}
        onClick={() => { setOpen((o) => !o); setAddMode(false); setSearch(""); }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={cn("truncate", !selected && "text-muted-foreground/60")}>
          {selected ? selected.label : "Selecione um parceiro"}
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 flex-shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-[200px] rounded-xl border border-border bg-card shadow-[4px_4px_0_rgba(0,0,0,0.08)] overflow-hidden">
          {/* Search */}
          <div className="border-b border-border p-2">
            <input
              type="text"
              placeholder="Buscar parceiro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg bg-secondary/50 px-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground/60 focus:bg-secondary"
              autoFocus
            />
          </div>

          {/* Lista */}
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 && !addMode && (
              <p className="px-3 py-3 text-center text-xs text-muted-foreground">
                Nenhum parceiro encontrado
              </p>
            )}
            {filtered.map((p) => (
              <button
                key={p.nome}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors hover:bg-secondary",
                  p.nome === value && "bg-primary/8 text-primary font-medium"
                )}
                onClick={() => handleSelect(p.nome)}
              >
                <Check className={cn("h-3.5 w-3.5 flex-shrink-0", p.nome === value ? "opacity-100" : "opacity-0")} />
                {p.label}
              </button>
            ))}
          </div>

          {/* Adicionar novo */}
          <div className="border-t border-border">
            {!addMode ? (
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
                onClick={() => { setAddMode(true); setNovoLabel(search); }}
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar novo parceiro
              </button>
            ) : (
              <form onSubmit={handleAddSubmit} className="p-2 flex flex-col gap-1.5">
                <input
                  ref={addInputRef}
                  type="text"
                  placeholder="Nome do parceiro..."
                  value={novoLabel}
                  onChange={(e) => { setNovoLabel(e.target.value); setAddError(null); }}
                  className="w-full rounded-lg bg-secondary/50 px-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground/60 focus:bg-secondary border border-border focus:border-primary/50"
                />
                {addError && <p className="text-[11px] text-destructive">{addError}</p>}
                <div className="flex gap-1.5">
                  <button
                    type="submit"
                    disabled={isPending || !novoLabel.trim()}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                  >
                    {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                    Salvar
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary"
                    onClick={() => { setAddMode(false); setAddError(null); }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
