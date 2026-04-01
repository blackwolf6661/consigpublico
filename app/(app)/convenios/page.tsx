import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import { listarConvenios } from "@/actions/convenios";
import { ConveniosTable } from "@/components/convenios/convenios-table";
import { SearchBox } from "@/components/convenios/search-box";
import { cn } from "@/lib/utils";
import type { StatusConvenio } from "@/lib/constants";

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}

const STATUS_TABS: { label: string; value: string }[] = [
  { label: "Todos",      value: "" },
  { label: "Assinados",  value: "CONVENIO_ASSINADO" },
  { label: "Pendentes",  value: "CONVENIO_PENDENTE_ASSINATURA_PARTES" },
  { label: "Publicados", value: "CONVENIO_PUBLICADO_DIARIO_OFICIAL" },
  { label: "Cancelados", value: "OFICIO_CANCELADO" },
];

export default async function ConveniosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page   = Math.max(1, Number(params.page ?? 1));
  const activeStatus = params.status ?? "";

  const { convenios, total, totalPages, perPage } = await listarConvenios({
    page,
    perPage: 20,
    search: params.search,
    ...(activeStatus ? { status: activeStatus as StatusConvenio } : {}),
  });

  const rows = (convenios as any[]).map((c) => ({
    ...c,
    tx:       c.tx?.toString()       ?? null,
    comissao: c.comissao?.toString() ?? null,
  }));

  return (
    <div>
      {/* ── Tab Navigation — .body-top equivalent ──────────── */}
      <div className="ds-tab-nav px-8 ds-animate-in">
        <Link href="/" className="ds-tab-link">
          <ArrowLeft className="mr-1.5 h-4 w-4 opacity-60" />
          Dashboard
        </Link>
        <span className="ds-tab-link ds-active">Convênios</span>
        <span className="ds-tab-link" style={{ cursor: "not-allowed", opacity: 0.4 }}>Relatórios</span>
        <span className="ds-tab-link" style={{ cursor: "not-allowed", opacity: 0.4 }}>Análises</span>
      </div>

      <div className="p-8 space-y-6">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 ds-animate-in ds-animate-in-1">
          <div>
            <h2 className="text-[26px] font-bold leading-tight text-foreground">
              Todos os Convênios
            </h2>
            <p className="text-[14px] text-muted-foreground">
              {total === 0
                ? "Nenhum registro encontrado"
                : `${total} convênio${total !== 1 ? "s" : ""} cadastrado${total !== 1 ? "s" : ""}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Suspense>
              <SearchBox defaultValue={params.search ?? ""} />
            </Suspense>
            <Link
              href="/convenios/novo"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:-translate-y-px shadow-sm shadow-primary/20 active:translate-y-0"
            >
              <Plus className="h-3.5 w-3.5" />
              Novo Convênio
            </Link>
          </div>
        </div>

        {/* ── Status filter pills — .dates-wrap equivalent ──── */}
        <div className="flex items-center gap-2 ds-animate-in ds-animate-in-2">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={tab.value
                ? `/convenios?status=${tab.value}`
                : "/convenios"
              }
              className={cn("ds-filter-btn", tab.value === activeStatus && "ds-active")}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* ── Table ──────────────────────────────────────────── */}
        <div className="ds-animate-in ds-animate-in-3">
          <ConveniosTable
            data={rows}
            total={total}
            page={page}
            totalPages={totalPages}
            perPage={perPage}
          />
        </div>

      </div>
    </div>
  );
}
