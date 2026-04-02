import {
  FileText,
  CheckCircle2,
  Clock,
  Newspaper,
  XCircle,
  Users,
  Package,
  FileCheck,
} from "lucide-react";
import Link from "next/link";
import { getEstatisticasDashboard } from "@/actions/convenios";
import { STATUS_LABELS, PARCEIRO_LABELS, PRODUTO_LABELS } from "@/lib/constants";
import type { StatusConvenio, Parceiro, Produto } from "@/lib/constants";
import { cn } from "@/lib/utils";

// ─── SVG path generator from real data ────────────────────────────────────────
// Converts an array of numbers into a smooth cubic-bezier SVG path,
// normalized to fit the 220×70 viewBox with padding.

type SvgPaths = { line: string; area: string; pts: { x: number; y: number }[] };

function f(n: number) { return n.toFixed(1); }

function buildSvgPath(values: number[], W = 220, H = 70, pad = 8): SvgPaths {
  const flat = { line: `M0 ${H / 2} L${W} ${H / 2}`, area: `M0 ${H / 2} L${W} ${H / 2} L${W} ${H} L0 ${H}Z`, pts: [{ x: 0, y: H / 2 }] };
  if (!values || values.length < 2) return flat;

  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = max === min ? 1 : max - min;

  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * W,
    y: pad + (1 - (v - min) / range) * (H - pad * 2),
  }));

  let d = `M${f(pts[0].x)} ${f(pts[0].y)}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const mx = (a.x + b.x) / 2;
    d += ` C${f(mx)} ${f(a.y)} ${f(mx)} ${f(b.y)} ${f(b.x)} ${f(b.y)}`;
  }
  const last = pts[pts.length - 1];
  return { line: d, area: d + ` L${f(last.x)} ${H} L0 ${H}Z`, pts };
}

// ─── GraphLine — data-driven SVG ──────────────────────────────────────────────

function GraphLine({ data }: { data: number[] }) {
  const { line, area, pts } = buildSvgPath(data);
  return (
    <svg viewBox="0 0 220 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="graphFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(0,210,199,0.35)" />
          <stop offset="100%" stopColor="rgba(0,210,199,0.00)" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <path d={area} fill="url(#graphFill)" />
      {/* Animated line */}
      <path
        className="ds-graph-path"
        d={line}
        stroke="var(--primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Data point dots */}
      {pts.map((pt, i) => (
        <circle key={i} cx={pt.x} cy={pt.y} r="3" fill="var(--primary)" opacity="0.9" />
      ))}
    </svg>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

type StatVariant = "default" | "teal" | "dark";

function StatCard({
  title, value, description, icon: Icon, variant = "default", delay = 0,
}: {
  title: string; value: number; description: string;
  icon: React.ElementType; variant?: StatVariant; delay?: number;
}) {
  const V: Record<StatVariant, { wrap: string; icon: string; lbl: string; val: string }> = {
    default: { wrap: "bg-card border-border",    icon: "text-primary",          lbl: "text-muted-foreground", val: "text-foreground"   },
    teal:    { wrap: "bg-primary border-primary/30",icon:"text-primary-foreground/80",lbl:"text-primary-foreground/70",val:"text-primary-foreground"},
    dark:    { wrap: "bg-foreground border-foreground",icon:"text-background/70",  lbl: "text-background/60",    val: "text-background"   },
  };
  const v = V[variant];
  return (
    <div className={cn("relative rounded-[20px] border-2 p-6 cursor-default ds-stat-card", `ds-animate-in-${delay}`, v.wrap)}>
      <div className="mb-4"><Icon className={cn("h-5 w-5", v.icon)} /></div>
      <p className={cn("text-[13px] font-semibold uppercase tracking-widest", v.lbl)}>{title}</p>
      <p className={cn("mt-1 text-[2rem] font-bold tracking-tight leading-none ds-number", `ds-number-${delay}`, v.val)}>
        {value.toLocaleString("pt-BR")}
      </p>
      <p className={cn("mt-1.5 text-[11px] opacity-70", v.lbl)}>{description}</p>
    </div>
  );
}

// ─── Graph Card (dark) — fluxo mensal real ────────────────────────────────────

type Stats = Awaited<ReturnType<typeof getEstatisticasDashboard>>;

function GraphCard({ stats }: { stats: Stats }) {
  const { totalConvenios, conveniosAssinados, conveniosPublicados, dadosMensais } = stats;
  const pct = totalConvenios > 0 ? Math.round((conveniosAssinados / totalConvenios) * 100) : 0;
  const totalData = dadosMensais.map((d) => d.total);
  const hasData   = totalData.some((v) => v > 0);

  return (
    <div className="ds-graph-card ds-animate-in-2 flex-1">
      {/* .graph-card__top */}
      <div className="ds-graph-card-top">
        <div className="flex flex-col gap-1.5">
          <p className="text-[13px] font-semibold text-primary">
            {pct > 0 ? `${pct}% assinados` : "Nenhum dado"}
          </p>
          <p className="text-[2.4rem] font-bold text-white leading-none ds-number ds-number-2">
            {totalConvenios.toLocaleString("pt-BR")}
          </p>
          <p className="text-[13px] text-white/50 font-medium">Total cadastrados</p>
        </div>
        {/* Real SVG graph */}
        <div className="flex-1 max-w-[180px] h-[70px]">
          {hasData ? (
            <GraphLine data={totalData} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-[11px] text-white/20">Sem dados recentes</p>
            </div>
          )}
        </div>
      </div>
      {/* .graph-card__bot */}
      <div className="ds-graph-card-bot">
        {/* Assinados + Publicados */}
        <div className="flex items-end gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="ds-legend-dot ds-legend-dot-primary" />
              <span className="text-[11px] text-white/40">Assinados</span>
            </div>
            <p className="text-[1.2rem] font-bold text-white leading-none">{conveniosAssinados}</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="ds-legend-dot" style={{ background: "#3b82f6" }} />
              <span className="text-[11px] text-white/40">Publicados</span>
            </div>
            <p className="text-[1.2rem] font-bold text-white leading-none">{conveniosPublicados}</p>
          </div>
        </div>
        {/* Month labels from real data */}
        <div className="flex gap-3">
          {dadosMensais.map((d, i) => (
            <span
              key={d.mes}
              title={`${d.label}: ${d.total} cadastros`}
              className={cn(
                "text-[11px] font-medium cursor-default transition-colors",
                i === dadosMensais.length - 1 ? "text-primary" : "text-white/30 hover:text-white/60"
              )}
            >
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Status dot color ─────────────────────────────────────────────────────────

function getStatusColor(status: string): string {
  if (status.includes("ASSINADO"))                                   return "#10b981";
  if (status.includes("PENDENTE") || status.includes("ELABORA"))    return "#f59e0b";
  if (status.includes("PUBLICADO") || status.includes("DIARIO"))    return "#3b82f6";
  if (status.includes("CANCELADO"))                                  return "#ef4444";
  if (status.includes("CREDENCIAMENTO") || status.includes("ENVIADO")) return "#06b6d4";
  if (status.startsWith("KIT"))                                      return "#8b5cf6";
  return "#94a3b8";
}

// ─── Status Row (distribuição por status) ─────────────────────────────────────

function StatusRow({ status, count, total }: { status: StatusConvenio; count: number; total: number }) {
  const pct   = total > 0 ? (count / total) * 100 : 0;
  const color = getStatusColor(status);
  return (
    <div className="ds-grid-row">
      <div className="flex items-center gap-3">
        <div className="ds-legend-dot" style={{ background: color }} />
        <span className="text-[13px] font-medium text-foreground">{STATUS_LABELS[status]}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[13px] font-bold text-foreground tabular-nums">{count}</span>
        <div className="h-2 w-20 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
        </div>
        <span className="text-[11px] text-muted-foreground tabular-nums w-9 text-right">{pct.toFixed(0)}%</span>
      </div>
    </div>
  );
}

// ─── Cores dos parceiros ──────────────────────────────────────────────────────

const PARCEIRO_COLORS = ["#00d2c7", "#3b82f6", "#8b5cf6", "#f59e0b", "#10b981"];
const PRODUTO_COLORS  = ["#00d2c7", "#3b82f6", "#8b5cf6", "#f59e0b", "#10b981"];

// ─── Dashboard Page ────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  let stats: Awaited<ReturnType<typeof getEstatisticasDashboard>>;
  try {
    stats = await getEstatisticasDashboard();
  } catch (err) {
    // Loga o erro completo nos Function Logs do Vercel
    console.error("[DashboardPage] ERRO AO CARREGAR ESTATÍSTICAS:");
    console.error("[DashboardPage] type:", typeof err);
    if (err instanceof Error) {
      console.error("[DashboardPage] name:", err.name);
      console.error("[DashboardPage] message:", err.message);
      console.error("[DashboardPage] stack:", err.stack);
      if ((err as NodeJS.ErrnoException).cause) console.error("[DashboardPage] cause:", (err as NodeJS.ErrnoException).cause);
    } else {
      console.error("[DashboardPage] raw:", String(err));
    }
    throw err; // re-throw para o error boundary capturar
  }

  const kpis = [
    { title: "Total",      value: stats.totalConvenios,     description: "Todos os registros",    icon: FileText,     variant: "default" as StatVariant, delay: 1 },
    { title: "Assinados",  value: stats.conveniosAssinados, description: "Contratos assinados",   icon: CheckCircle2, variant: "default" as StatVariant, delay: 2 },
    { title: "Pendentes",  value: stats.conveniosPendentes, description: "Aguardando ação",       icon: Clock,        variant: "default" as StatVariant, delay: 3 },
    { title: "Publicados", value: stats.conveniosPublicados,description: "Em Diário Oficial",     icon: Newspaper,    variant: "dark"    as StatVariant, delay: 4 },
    { title: "Cancelados", value: stats.conveniosCancelados,description: "Convênios cancelados",  icon: XCircle,      variant: "default" as StatVariant, delay: 5 },
  ];

  return (
    <div>
      {/* ── Tabs ─────────────────────────────────────────── */}
      <div className="ds-tab-nav px-8 ds-animate-in">
        <span className="ds-tab-link ds-active">Visão Geral</span>
        <Link href="/convenios" className="ds-tab-link">Convênios</Link>
        <span className="ds-tab-link" style={{ cursor: "not-allowed", opacity: 0.4 }}>Relatórios</span>
        <span className="ds-tab-link" style={{ cursor: "not-allowed", opacity: 0.4 }}>Análises</span>
      </div>

      <div className="p-8 space-y-8">

        {/* ── Row 1: Legend + Stat Cards ────────────────── */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[13px] text-muted-foreground mb-2">
                Distribuição dos convênios públicos por situação
              </p>
              <div className="flex items-center gap-5 flex-wrap">
                <span className="ds-legend"><span className="ds-legend-dot ds-legend-dot-primary" />Assinados</span>
                <span className="ds-legend"><span className="ds-legend-dot ds-legend-dot-dark" />Publicados</span>
                <span className="ds-legend"><span className="ds-legend-dot ds-legend-dot-amber" />Pendentes</span>
                <span className="ds-legend"><span className="ds-legend-dot" style={{ background: "#ef4444" }} />Cancelados</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Link href="/convenios" className="ds-filter-btn">Ver todos</Link>
              <Link href="/convenios/novo" className="ds-filter-btn ds-active">+ Novo</Link>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {kpis.map((kpi) => <StatCard key={kpi.title} {...kpi} />)}
          </div>
        </section>

        {/* ── Row 2: Fluxo mensal + Distribuição por Status ─ */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Left — Gráfico de fluxo (dados reais do DB) */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[22px] font-bold leading-tight text-foreground">Fluxo de Convênios</h2>
              <div className="flex items-center gap-2">
                <span className="ds-legend text-[11px]">
                  <span className="ds-legend-dot ds-legend-dot-primary" />Cadastros/mês (últimos 6)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <span className="ds-legend"><span className="ds-legend-dot ds-legend-dot-primary" />Assinados</span>
              <span className="ds-legend"><span className="ds-legend-dot" style={{ background: "#3b82f6" }} />Publicados</span>
            </div>
            <GraphCard stats={stats} />

            {/* Mini monthly breakdown table */}
            {stats.dadosMensais.some(d => d.total > 0) && (
              <div className="grid grid-cols-6 gap-1">
                {stats.dadosMensais.map((d) => (
                  <div key={d.mes} className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card py-2">
                    <span className="text-[10px] text-muted-foreground font-semibold">{d.label}</span>
                    <span className="text-[15px] font-bold text-foreground tabular-nums">{d.total}</span>
                    <span className="text-[9px] text-primary font-medium tabular-nums">
                      {d.assinados > 0 ? `${d.assinados}✓` : "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right — Distribuição por status (todos) */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[22px] font-bold leading-tight text-foreground">Por Status</h2>
              <span className="text-[12px] text-muted-foreground">
                {stats.porStatus.length} status · {stats.totalConvenios} total
              </span>
            </div>
            <div className="flex items-center gap-5 mb-1">
              <span className="ds-legend"><span className="ds-legend-dot ds-legend-dot-primary" />Assinados</span>
              <span className="ds-legend"><span className="ds-legend-dot ds-legend-dot-amber" />Pendentes</span>
            </div>
            <div className="rounded-[20px] border-2 border-border bg-card px-4 py-3 ds-animate-in-3">
              {stats.porStatus.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center gap-2">
                  <FileText className="h-8 w-8 text-muted-foreground/20" strokeWidth={1.5} />
                  <p className="text-[13px] text-muted-foreground">Sem dados</p>
                  <p className="text-[11px] text-muted-foreground/60">Cadastre convênios para ver a distribuição</p>
                </div>
              ) : (
                stats.porStatus.map((s) => (
                  <StatusRow
                    key={s.status}
                    status={s.status as StatusConvenio}
                    count={s._count._all}
                    total={stats.totalConvenios}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Row 3: Top Estados + Resumo Executivo (dados reais) ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Top 5 Estados */}
          <div className="ds-animate-in-4">
            <h2 className="text-[22px] font-bold leading-tight text-foreground mb-5">Top 5 Estados</h2>
            <div className="rounded-[20px] border-2 border-border bg-card overflow-hidden">
              <div className="grid grid-cols-3 gap-4 px-5 py-3.5 border-b-2 border-border bg-secondary/30">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Estado</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Total</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Share</p>
              </div>
              {stats.porEstado.length === 0 ? (
                <div className="flex h-32 items-center justify-center">
                  <p className="text-[13px] text-muted-foreground">Sem dados</p>
                </div>
              ) : (
                stats.porEstado.map((e, i) => {
                  const pct = stats.totalConvenios > 0
                    ? ((e._count._all / stats.totalConvenios) * 100).toFixed(1)
                    : "0.0";
                  return (
                    <div
                      key={e.estado}
                      className={cn(
                        "grid grid-cols-3 gap-4 px-5 py-3.5 items-center",
                        i < stats.porEstado.length - 1 && "border-b border-border",
                        "transition-colors hover:bg-secondary/30"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: PARCEIRO_COLORS[i] }}
                        />
                        <span className="text-[13px] font-bold text-primary font-mono">{e.estado}</span>
                      </div>
                      <span className="text-[13px] font-semibold text-foreground text-right tabular-nums">
                        {e._count._all}
                      </span>
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: PARCEIRO_COLORS[i] }}
                          />
                        </div>
                        <span className="text-[11px] text-muted-foreground tabular-nums w-9 text-right">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Resumo Executivo — todos dados reais */}
          <div className="ds-animate-in-5">
            <h2 className="text-[22px] font-bold leading-tight text-foreground mb-5">Resumo Executivo</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* Coluna A — Contratos (dados reais de contratoConvenio / prorrogavel / decreto) */}
              <div className="rounded-[20px] border-2 border-border bg-card overflow-hidden">
                <div className="px-5 py-3.5 border-b-2 border-border bg-secondary/30 flex items-center gap-2">
                  <FileCheck className="h-3.5 w-3.5 text-primary" />
                  <p className="text-[12px] font-bold text-foreground">Contratos</p>
                </div>
                {[
                  { label: "Com contrato",  value: stats.comContrato,      color: "#10b981" },
                  { label: "Sem contrato",  value: stats.semContrato,      color: "#f59e0b" },
                  { label: "Prorrogáveis",  value: stats.prorrogaveis,     color: "#3b82f6" },
                  { label: "Com decreto",   value: stats.comDecretoCount,  color: "#8b5cf6" },
                ].map((row, i, arr) => (
                  <div
                    key={row.label}
                    className={cn(
                      "flex items-center justify-between px-5 py-3",
                      i < arr.length - 1 && "border-b border-border",
                      "transition-colors hover:bg-secondary/30"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: row.color }} />
                      <p className="text-[13px] text-muted-foreground">{row.label}</p>
                    </div>
                    <p className="text-[13px] font-bold text-foreground tabular-nums">{row.value}</p>
                  </div>
                ))}
              </div>

              {/* Coluna B — Pendências (dados reais) */}
              <div className="rounded-[20px] border-2 border-border bg-card overflow-hidden">
                <div className="px-5 py-3.5 border-b-2 border-border bg-secondary/30 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  <p className="text-[12px] font-bold text-foreground">Pendências</p>
                </div>
                {[
                  { label: "A assinar",      value: stats.conveniosPendentes,  color: "#f59e0b" },
                  { label: "Publicação D.O.", value: stats.conveniosPublicados, color: "#3b82f6" },
                  { label: "Cancelados",     value: stats.conveniosCancelados, color: "#ef4444" },
                  { label: "Assinados",      value: stats.conveniosAssinados,  color: "#10b981" },
                ].map((row, i, arr) => (
                  <div
                    key={row.label}
                    className={cn(
                      "flex items-center justify-between px-5 py-3",
                      i < arr.length - 1 && "border-b border-border",
                      "transition-colors hover:bg-secondary/30"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: row.color }} />
                      <p className="text-[13px] text-muted-foreground">{row.label}</p>
                    </div>
                    <p className="text-[13px] font-bold text-foreground tabular-nums">{row.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 4: Por Parceiro + Por Produto ─────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 ds-animate-in-5">

          {/* Por Parceiro */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-[22px] font-bold leading-tight text-foreground">Por Parceiro</h2>
            </div>
            <div className="rounded-[20px] border-2 border-border bg-card overflow-hidden">
              <div className="grid grid-cols-3 gap-4 px-5 py-3.5 border-b-2 border-border bg-secondary/30">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Parceiro</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Total</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Share</p>
              </div>
              {stats.porParceiro.length === 0 ? (
                <div className="flex h-24 items-center justify-center">
                  <p className="text-[13px] text-muted-foreground">Sem dados</p>
                </div>
              ) : (
                stats.porParceiro.map((p, i) => {
                  const pct = stats.totalConvenios > 0
                    ? ((p._count._all / stats.totalConvenios) * 100)
                    : 0;
                  return (
                    <div
                      key={p.parceiro}
                      className={cn(
                        "grid grid-cols-3 gap-4 px-5 py-3.5 items-center",
                        i < stats.porParceiro.length - 1 && "border-b border-border",
                        "transition-colors hover:bg-secondary/30"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PARCEIRO_COLORS[i % PARCEIRO_COLORS.length] }} />
                        <span className="text-[13px] font-semibold text-foreground">
                          {PARCEIRO_LABELS[p.parceiro as Parceiro] ?? p.parceiro}
                        </span>
                      </div>
                      <span className="text-[13px] font-bold text-foreground text-right tabular-nums">
                        {p._count._all}
                      </span>
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: PARCEIRO_COLORS[i % PARCEIRO_COLORS.length] }}
                          />
                        </div>
                        <span className="text-[11px] text-muted-foreground tabular-nums w-9 text-right">
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Top 5 Produtos */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Package className="h-5 w-5 text-primary" />
              <h2 className="text-[22px] font-bold leading-tight text-foreground">Top 5 Produtos</h2>
            </div>
            <div className="rounded-[20px] border-2 border-border bg-card overflow-hidden">
              <div className="grid grid-cols-3 gap-4 px-5 py-3.5 border-b-2 border-border bg-secondary/30">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground col-span-2">Produto</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Total</p>
              </div>
              {stats.porProduto.length === 0 ? (
                <div className="flex h-24 items-center justify-center">
                  <p className="text-[13px] text-muted-foreground">Sem dados</p>
                </div>
              ) : (
                stats.porProduto.map((p, i) => {
                  const pct = stats.totalConvenios > 0
                    ? ((p._count._all / stats.totalConvenios) * 100)
                    : 0;
                  return (
                    <div
                      key={p.produto}
                      className={cn(
                        "grid grid-cols-3 gap-4 px-5 py-3.5 items-center",
                        i < stats.porProduto.length - 1 && "border-b border-border",
                        "transition-colors hover:bg-secondary/30"
                      )}
                    >
                      <div className="flex items-center gap-2 col-span-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PRODUTO_COLORS[i % PRODUTO_COLORS.length] }} />
                        <span className="text-[13px] font-medium text-foreground leading-tight">
                          {PRODUTO_LABELS[p.produto as Produto] ?? p.produto}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-10 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: PRODUTO_COLORS[i % PRODUTO_COLORS.length] }}
                          />
                        </div>
                        <span className="text-[13px] font-bold text-foreground text-right tabular-nums w-6">
                          {p._count._all}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
