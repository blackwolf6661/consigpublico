"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, FileText, Plus, Columns3, Check, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { useState, useTransition } from "react";
import { excluirConvenio } from "@/actions/convenios";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PARCEIRO_LABELS,
  ESTADO_LABELS,
  PRODUTO_LABELS,
  IF_LABELS,
  CAPAG_LABELS,
} from "@/lib/constants";
import type {
  StatusConvenio,
  Parceiro,
  Estado,
  Produto,
  InstituicaoFinanceira,
  Capag,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

export type ConvenioRow = {
  id: string;
  estado: string;
  parceiro: string;
  institucaoFinanceira: string | null;
  capag: string | null;
  bancos: string | null;
  processadora: string | null;
  orgaoCompetente: string | null;
  decreto: boolean;
  produto: string;
  contratoConvenio: boolean;
  prazoContrato: string | null;
  prorrogavel: boolean;
  dataAssinatura: Date | null;
  validade: Date | null;
  status: string;
  dataObs: Date | null;
  obs: string | null;
  funding: string | null;
  tx: unknown;
  comissao: unknown;
  criadoEm: Date;
};

function fmt(date: Date | null) {
  if (!date) return "—";
  return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
}

function fmtDecimal(val: unknown) {
  if (val === null || val === undefined) return "—";
  const n = Number(val);
  return isNaN(n) ? "—" : n.toFixed(2).replace(".", ",") + "%";
}

function BoolBadge({ value }: { value: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold",
        value
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          : "border-slate-500/30 bg-slate-500/10 text-slate-400"
      )}
    >
      {value ? "Sim" : "Não"}
    </span>
  );
}

const columns: ColumnDef<ConvenioRow>[] = [
  {
    id: "estado",
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => (
      <Tooltip>
        <TooltipTrigger>
          <span className="font-mono text-xs font-bold text-primary cursor-default">
            {row.original.estado}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {ESTADO_LABELS[row.original.estado as Estado] ?? row.original.estado}
        </TooltipContent>
      </Tooltip>
    ),
  },
  {
    id: "parceiro",
    accessorKey: "parceiro",
    header: "Parceiro",
    cell: ({ row }) => (
      <span className="text-xs">
        {PARCEIRO_LABELS[row.original.parceiro as Parceiro] ?? row.original.parceiro}
      </span>
    ),
  },
  {
    id: "institucaoFinanceira",
    accessorKey: "institucaoFinanceira",
    header: "IF",
    cell: ({ row }) => (
      <span className="text-xs">
        {row.original.institucaoFinanceira
          ? IF_LABELS[row.original.institucaoFinanceira as InstituicaoFinanceira] ?? row.original.institucaoFinanceira
          : "—"}
      </span>
    ),
  },
  {
    id: "capag",
    accessorKey: "capag",
    header: "CAPAG",
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-md border border-border px-1.5 py-0.5 font-mono text-[10px]">
        {row.original.capag ? CAPAG_LABELS[row.original.capag as Capag] ?? row.original.capag : "—"}
      </span>
    ),
  },
  {
    id: "orgaoCompetente",
    accessorKey: "orgaoCompetente",
    header: "Órgão Competente",
    cell: ({ row }) => (
      <Tooltip>
        <TooltipTrigger>
          <span className="line-clamp-1 block max-w-[160px] text-xs cursor-default">
            {row.original.orgaoCompetente ?? "—"}
          </span>
        </TooltipTrigger>
        {row.original.orgaoCompetente && (
          <TooltipContent>{row.original.orgaoCompetente}</TooltipContent>
        )}
      </Tooltip>
    ),
  },
  {
    id: "produto",
    accessorKey: "produto",
    header: "Produto",
    cell: ({ row }) => (
      <span className="text-xs">
        {PRODUTO_LABELS[row.original.produto as Produto] ?? row.original.produto}
      </span>
    ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = row.original.status as StatusConvenio;
      return (
        <span
          className={cn(
            "inline-flex items-center whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
            STATUS_COLORS[s]
          )}
        >
          {STATUS_LABELS[s] ?? s}
        </span>
      );
    },
  },
  {
    id: "decreto",
    accessorKey: "decreto",
    header: "Decreto",
    cell: ({ row }) => <BoolBadge value={row.original.decreto} />,
  },
  {
    id: "contratoConvenio",
    accessorKey: "contratoConvenio",
    header: "Contrato",
    cell: ({ row }) => <BoolBadge value={row.original.contratoConvenio} />,
  },
  {
    id: "prorrogavel",
    accessorKey: "prorrogavel",
    header: "Prorrogável",
    cell: ({ row }) => <BoolBadge value={row.original.prorrogavel} />,
  },
  {
    id: "prazoContrato",
    accessorKey: "prazoContrato",
    header: "Prazo (meses)",
    cell: ({ row }) => (
      <span className="text-xs">{row.original.prazoContrato ?? "—"}</span>
    ),
  },
  {
    id: "dataAssinatura",
    accessorKey: "dataAssinatura",
    header: "Assinatura",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{fmt(row.original.dataAssinatura)}</span>
    ),
  },
  {
    id: "validade",
    accessorKey: "validade",
    header: "Validade",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{fmt(row.original.validade)}</span>
    ),
  },
  {
    id: "bancos",
    accessorKey: "bancos",
    header: "Bancos",
    cell: ({ row }) => (
      <span className="text-xs">{row.original.bancos ?? "—"}</span>
    ),
  },
  {
    id: "processadora",
    accessorKey: "processadora",
    header: "Processadora",
    cell: ({ row }) => (
      <span className="text-xs">{row.original.processadora ?? "—"}</span>
    ),
  },
  {
    id: "funding",
    accessorKey: "funding",
    header: "Funding",
    cell: ({ row }) => (
      <span className="text-xs">{row.original.funding ?? "—"}</span>
    ),
  },
  {
    id: "tx",
    accessorKey: "tx",
    header: "TX (%)",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{fmtDecimal(row.original.tx)}</span>
    ),
  },
  {
    id: "comissao",
    accessorKey: "comissao",
    header: "Comissão (%)",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{fmtDecimal(row.original.comissao)}</span>
    ),
  },
  {
    id: "obs",
    accessorKey: "obs",
    header: "OBS",
    cell: ({ row }) => (
      <Tooltip>
        <TooltipTrigger>
          <span className="line-clamp-1 block max-w-[140px] text-xs text-muted-foreground cursor-default">
            {row.original.obs ?? "—"}
          </span>
        </TooltipTrigger>
        {row.original.obs && (
          <TooltipContent className="max-w-xs">{row.original.obs}</TooltipContent>
        )}
      </Tooltip>
    ),
  },
  // ── Ações (sempre visível, não aparecem no toggle Colunas) ──
  {
    id: "_acoes",
    enableHiding: false,
    header: "",
    cell: ({ row }) => {
      const c = row.original;
      const label = [
        c.estado,
        PARCEIRO_LABELS[c.parceiro as Parceiro] ?? c.parceiro,
        c.orgaoCompetente,
      ]
        .filter(Boolean)
        .join(" · ");
      return (
        <div className="flex items-center gap-1.5">
          <Link
            href={`/convenios/${c.id}/editar`}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-secondary/40 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
            title="Editar convênio"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link>
          <DeleteConvenioButton id={c.id} label={label} />
        </div>
      );
    },
  },
];

// ─── Estilo de botão de paginação (ds-filter-btn pattern) ───────────────────────

const paginationBtnBase     = "ds-filter-btn gap-1.5";
const paginationBtnActive   = "ds-filter-btn ds-active !px-2.5";
const paginationBtnInactive = "ds-filter-btn !px-2.5";

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card/50 p-12">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-secondary/50">
        <FileText className="h-10 w-10 text-muted-foreground/40" strokeWidth={1.5} />
      </div>
      <div className="text-center">
        <h3 className="text-base font-semibold text-foreground">
          Nenhum convênio cadastrado
        </h3>
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          Comece cadastrando o primeiro convênio público. Os dados aparecerão
          aqui assim que forem inseridos.
        </p>
      </div>
      <Link
        href="/convenios/novo"
        className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Plus className="h-4 w-4" />
        Cadastrar Primeiro Convênio
      </Link>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface ConveniosTableProps {
  data: ConvenioRow[];
  total: number;
  page: number;
  totalPages: number;
  perPage: number;
}

// ─── Botão de exclusão com dialog de confirmação ──────────────────────────────

function DeleteConvenioButton({ id, label }: { id: string; label: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await excluirConvenio(id);
      if (result.success) {
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-secondary/40 text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
        title="Excluir convênio"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="max-w-sm p-0 overflow-hidden">
        {/* Header vermelho */}
        <div className="flex flex-col items-center gap-3 bg-destructive/10 px-6 pt-8 pb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15 ring-4 ring-destructive/10">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-base font-semibold text-foreground">
              Excluir convênio?
            </DialogTitle>
            <DialogDescription className="text-xs text-center">
              {label}
            </DialogDescription>
          </DialogHeader>
        </div>
        {/* Aviso */}
        <div className="px-6 py-4">
          <p className="text-[13px] text-muted-foreground text-center">
            Esta ação é <span className="font-semibold text-destructive">permanente</span> e não pode ser desfeita.
            Todos os dados do convênio serão removidos.
          </p>
        </div>
        {/* Botões */}
        <div className="flex gap-2 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={pending}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-secondary/40 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-destructive/90 disabled:opacity-60"
          >
            {pending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Excluir
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Mapa de label legível para o dropdown ──────────────────────────────
const COLUMN_LABELS: Record<string, string> = {
  estado: "Estado",
  parceiro: "Parceiro",
  institucaoFinanceira: "IF",
  capag: "CAPAG",
  orgaoCompetente: "Órgão Competente",
  produto: "Produto",
  status: "Status",
  decreto: "Decreto",
  contratoConvenio: "Contrato",
  prorrogavel: "Prorrogável",
  prazoContrato: "Prazo (meses)",
  dataAssinatura: "Assinatura",
  validade: "Validade",
  bancos: "Bancos",
  processadora: "Processadora",
  funding: "Funding",
  tx: "TX (%)",
  comissao: "Comissão (%)",
  obs: "OBS",
};

// Colunas visíveis por padrão (ocultar as menos usadas)
const DEFAULT_VISIBILITY: VisibilityState = {
  bancos: false,
  processadora: false,
  funding: false,
  prazoContrato: false,
  obs: false,
  dataAssinatura: false,
  validade: false,
};

export function ConveniosTable({
  data,
  total,
  page,
  totalPages,
  perPage,
}: ConveniosTableProps) {
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(DEFAULT_VISIBILITY);

  const table = useReactTable({
    data,
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  if (data.length === 0) return <EmptyState />;

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Exibindo{" "}
            <span className="font-medium text-foreground">
              {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)}
            </span>{" "}
            de{" "}
            <span className="font-medium text-foreground">{total}</span>{" "}
            convênios
          </p>
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground">
              Página {page} de {totalPages}
            </p>
            {/* ── Botão Colunas ── */}
            <Popover>
              <PopoverTrigger className="ds-filter-btn">
                <Columns3 className="mr-1.5 h-3.5 w-3.5 opacity-60" />
                Colunas
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/15 px-1 text-[10px] font-bold text-primary">
                  {table.getVisibleLeafColumns().length}
                </span>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-56 p-0 rounded-2xl border-2 border-border bg-card shadow-[4px_4px_0_rgba(0,0,0,0.10)] overflow-hidden"
              >
                {/* Header do popover */}
                <div className="flex items-center justify-between border-b-2 border-border px-4 py-3 bg-secondary/30">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Colunas
                  </span>
                  <button
                    onClick={() =>
                      table.toggleAllColumnsVisible(
                        !table.getIsAllColumnsVisible()
                      )
                    }
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    {table.getIsAllColumnsVisible() ? "Ocultar todas" : "Ver todas"}
                  </button>
                </div>
                {/* Lista de colunas */}
                <div className="max-h-72 overflow-y-auto py-1.5">
                  {table.getAllLeafColumns().filter((col) => col.getCanHide()).map((column) => (
                    <label
                      key={column.id}
                      className="flex cursor-pointer items-center gap-3 px-4 py-2 text-[13px] hover:bg-secondary/40 transition-colors"
                    >
                      {/* Checkbox visual */}
                      <span
                        className={cn(
                          "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-colors",
                          column.getIsVisible()
                            ? "border-primary bg-primary"
                            : "border-border bg-transparent"
                        )}
                      >
                        {column.getIsVisible() && (
                          <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />
                        )}
                      </span>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={column.getIsVisible()}
                        onChange={column.getToggleVisibilityHandler()}
                      />
                      <span className={cn(
                        "font-medium leading-none",
                        column.getIsVisible() ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {COLUMN_LABELS[column.id] ?? column.id}
                      </span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow
                    key={hg.id}
                    className="border-border hover:bg-transparent"
                  >
                    {hg.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="whitespace-nowrap bg-secondary/30 px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-border transition-all duration-150 hover:bg-secondary/30 cursor-default"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            {page > 1 ? (
              <Link href={`?page=${page - 1}`} className={paginationBtnBase}>
                <ChevronLeft className="h-3.5 w-3.5" />
                Anterior
              </Link>
            ) : (
              <span className={cn(paginationBtnBase, "opacity-40 pointer-events-none")}>
                <ChevronLeft className="h-3.5 w-3.5" />
                Anterior
              </span>
            )}

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = i + 1;
                return p === page ? (
                  <span key={p} className={paginationBtnActive}>{p}</span>
                ) : (
                  <Link key={p} href={`?page=${p}`} className={paginationBtnInactive}>{p}</Link>
                );
              })}
            </div>

            {page < totalPages ? (
              <Link href={`?page=${page + 1}`} className={paginationBtnBase}>
                Próxima
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span className={cn(paginationBtnBase, "opacity-40 pointer-events-none")}>
                Próxima
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
