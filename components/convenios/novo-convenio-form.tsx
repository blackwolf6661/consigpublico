"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save, CheckCircle2, ExternalLink, RotateCcw, Copy } from "lucide-react";
import Link from "next/link";
import { criarConvenioSchema, type CriarConvenioInput } from "@/lib/validations";
import { criarConvenio, type ConvenioSalvo, type ParceiroRow } from "@/actions/convenios";
import {
  ESTADOS, INSTITUICOES_FINANCEIRAS, CAPAGS, PRODUTOS, STATUSES,
  ESTADO_LABELS, PARCEIRO_LABELS, PRODUTO_LABELS, STATUS_LABELS, STATUS_COLORS, CAPAG_LABELS,
} from "@/lib/constants";
import { ParceiroCombobox } from "@/components/convenios/parceiro-combobox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ─── Helpers de estilo ────────────────────────────────────────────────────────

const inputClass =
  "w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary/50 focus:bg-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50";
const selectClass = cn(inputClass, "cursor-pointer");
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground";
const errorClass = "mt-1 text-[11px] text-destructive";

// ─── Componentes auxiliares ───────────────────────────────────────────────────

function FormField({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}{required && <span className="ml-1 text-destructive">*</span>}</label>
      {children}
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}

function BooleanToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary/40 p-1 w-fit">
      <button type="button" onClick={() => onChange(false)}
        className={cn("rounded-md px-3 py-1 text-xs font-medium transition-all",
          !value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
        Não
      </button>
      <button type="button" onClick={() => onChange(true)}
        className={cn("rounded-md px-3 py-1 text-xs font-medium transition-all",
          value ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
        Sim
      </button>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-5 border-b border-border pb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  );
}

// ─── Dialog de sucesso ────────────────────────────────────────────────────────

function SuccessDialog({
  convenio,
  onCadastrarOutro,
  onVerConvenios,
}: {
  convenio: ConvenioSalvo;
  onCadastrarOutro: () => void;
  onVerConvenios: () => void;
}) {
  const [aberto, setAberto] = useState(true);

  const handleClose = () => {
    setAberto(false);
    onCadastrarOutro();
  };

  const campos: [string, string][] = [
    ...(convenio.estado ? [["Estado", `${convenio.estado} — ${ESTADO_LABELS[convenio.estado as keyof typeof ESTADO_LABELS] ?? convenio.estado}`] as [string, string]] : []),
    ...(convenio.parceiro ? [["Parceiro", PARCEIRO_LABELS[convenio.parceiro as keyof typeof PARCEIRO_LABELS] ?? convenio.parceiro] as [string, string]] : []),
    ...(convenio.produto ? [["Produto", PRODUTO_LABELS[convenio.produto as keyof typeof PRODUTO_LABELS] ?? convenio.produto] as [string, string]] : []),
    ...(convenio.capag ? [["CAPAG", CAPAG_LABELS[convenio.capag as keyof typeof CAPAG_LABELS]] as [string, string]] : []),
    ...(convenio.tx ? [["TX", `${Number(convenio.tx).toFixed(4)}%`] as [string, string]] : []),
    ...(convenio.comissao ? [["Comissão", `${Number(convenio.comissao).toFixed(4)}%`] as [string, string]] : []),
  ];

  return (
    <Dialog open={aberto} onOpenChange={(open: boolean) => { if (!open) handleClose(); }}>
      <DialogContent showCloseButton={false} className="max-w-md p-0 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 bg-emerald-500/10 px-6 pt-8 pb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 ring-4 ring-emerald-500/10">
            <CheckCircle2 className="h-7 w-7 text-emerald-500" />
          </div>
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-base font-semibold text-foreground">Convênio cadastrado!</DialogTitle>
            <p className="text-xs text-muted-foreground">Registro salvo com sucesso no sistema</p>
          </DialogHeader>
        </div>

        {/* Detalhes */}
        <div className="px-6 py-4 space-y-3">
          {/* ID */}
          <div className="flex items-center justify-between rounded-lg bg-secondary/60 px-3 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">ID</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-foreground">{convenio.id.slice(0, 18)}…</span>
              <button type="button"
                onClick={() => { navigator.clipboard.writeText(convenio.id); toast.success("ID copiado!"); }}
                className="text-muted-foreground transition-colors hover:text-primary">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Grid de campos */}
          <div className="grid grid-cols-2 gap-2">
            {campos.map(([label, value]) => (
              <div key={label} className="rounded-lg bg-secondary/40 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="mt-0.5 text-xs font-medium text-foreground truncate" title={value}>{value}</p>
              </div>
            ))}
          </div>

          {/* Status badge */}
          {convenio.status && (
          <div className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
            <span className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
              STATUS_COLORS[convenio.status as keyof typeof STATUS_COLORS]
            )}>
              {STATUS_LABELS[convenio.status as keyof typeof STATUS_LABELS]}
            </span>
          </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex gap-2 border-t border-border px-6 py-4">
          <button type="button" onClick={handleClose}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-secondary/40 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
            <RotateCcw className="h-4 w-4" />
            Cadastrar outro
          </button>
          <button type="button" onClick={onVerConvenios}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
            <ExternalLink className="h-4 w-4" />
            Ver convênios
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Formulário principal ─────────────────────────────────────────────────────

export function NovoConvenioForm({ parceiros }: { parceiros: ParceiroRow[] }) {
  const router = useRouter();
  const [convenioSalvo, setConvenioSalvo] = useState<ConvenioSalvo | null>(null);

  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<CriarConvenioInput>({
      resolver: zodResolver(criarConvenioSchema),
      defaultValues: { decreto: false, contratoConvenio: false, prorrogavel: false },
    });

  const onSubmit = async (data: CriarConvenioInput) => {
    const result = await criarConvenio(data);
    if (result.success) {
      setConvenioSalvo(result.data);
    } else {
      toast.error("Erro ao cadastrar convênio", { description: result.error });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* ── Identificação ─────────────────────────────────────────────── */}
        <Section title="Identificação" description="Dados de identificação do convênio">
          <FormField label="Estado" error={errors.estado?.message}>
            <select {...register("estado", { setValueAs: (v: string) => v === "" ? null : v })} className={selectClass}>
              <option value="">Selecione um estado</option>
              {ESTADOS.map((e) => (
                <option key={e.value} value={e.value}>{e.value} — {e.label}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Parceiro" error={errors.parceiro?.message}>
            <Controller
              control={control}
              name="parceiro"
              render={({ field }) => (
                <ParceiroCombobox
                  parceiros={parceiros}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  error={errors.parceiro?.message}
                />
              )}
            />
          </FormField>

          <FormField label="Instituição Financeira (IF)" error={errors.institucaoFinanceira?.message}>
            <select {...register("institucaoFinanceira", { setValueAs: (v: string) => v === "" ? null : v })} className={selectClass}>
              <option value="">Selecione (opcional)</option>
              {INSTITUICOES_FINANCEIRAS.map((i) => (<option key={i.value} value={i.value}>{i.label}</option>))}
            </select>
          </FormField>

          <FormField label="CAPAG" error={errors.capag?.message}>
            <select {...register("capag", { setValueAs: (v: string) => v === "" ? null : v })} className={selectClass}>
              <option value="">Selecione (opcional)</option>
              {CAPAGS.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
            </select>
          </FormField>

          <FormField label="Produto" error={errors.produto?.message}>
            <select {...register("produto", { setValueAs: (v: string) => v === "" ? null : v })} className={selectClass}>
              <option value="">Selecione um produto</option>
              {PRODUTOS.map((p) => (<option key={p.value} value={p.value}>{p.label}</option>))}
            </select>
          </FormField>

          <FormField label="Status" error={errors.status?.message}>
            <select {...register("status", { setValueAs: (v: string) => v === "" ? null : v })} className={selectClass}>
              <option value="">Selecione um status</option>
              {STATUSES.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
            </select>
          </FormField>
        </Section>

        {/* ── Entidades ──────────────────────────────────────────────────── */}
        <Section title="Entidades Envolvidas">
          <FormField label="Órgão Competente" error={errors.orgaoCompetente?.message}>
            <input {...register("orgaoCompetente")} placeholder="Ex: Prefeitura Municipal de..." className={inputClass} />
          </FormField>
          <FormField label="Bancos" error={errors.bancos?.message}>
            <input {...register("bancos")} placeholder="Ex: Banco do Brasil, Caixa..." className={inputClass} />
          </FormField>
          <FormField label="Processadora" error={errors.processadora?.message}>
            <input {...register("processadora")} placeholder="Nome da processadora" className={inputClass} />
          </FormField>
          <FormField label="Funding" error={errors.funding?.message}>
            <input {...register("funding")} placeholder="Fonte de funding" className={inputClass} />
          </FormField>
        </Section>

        {/* ── Condições Contratuais ──────────────────────────────────────── */}
        <Section title="Condições Contratuais" description="Informações sobre prazos e vigência do contrato">
          <FormField label="Prazo do Contrato" error={errors.prazoContrato?.message}>
            <input {...register("prazoContrato")} placeholder="Ex: 12, 24, 36 meses" className={inputClass} />
          </FormField>
          <FormField label="Data de Assinatura" error={errors.dataAssinatura?.message}>
            <input type="date" {...register("dataAssinatura")} className={inputClass} />
          </FormField>
          <FormField label="Validade" error={errors.validade?.message}>
            <input type="date" {...register("validade")} className={inputClass} />
          </FormField>
          <FormField label="TX — Taxa (%)" error={errors.tx?.message}>
            <input type="number" step="0.0001" min="0" max="100"
              {...register("tx", { setValueAs: (v: string) => v === "" || v === null || v === undefined ? null : parseFloat(v) })}
              placeholder="Ex: 1.25" className={inputClass} />
          </FormField>
          <FormField label="Comissão (%)" error={errors.comissao?.message}>
            <input type="number" step="0.0001" min="0" max="100"
              {...register("comissao", { setValueAs: (v: string) => v === "" || v === null || v === undefined ? null : parseFloat(v) })}
              placeholder="Ex: 0.50" className={inputClass} />
          </FormField>
        </Section>

        {/* ── Flags Booleanas ─────────────────────────────────────────────── */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-5 border-b border-border pb-4">
            <h3 className="text-sm font-semibold text-foreground">Características</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Propriedades booleanas do convênio</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <FormField label="Decreto" error={errors.decreto?.message}>
              <Controller name="decreto" control={control}
                render={({ field }) => <BooleanToggle value={field.value} onChange={field.onChange} />} />
            </FormField>
            <FormField label="Contrato de Convênio" error={errors.contratoConvenio?.message}>
              <Controller name="contratoConvenio" control={control}
                render={({ field }) => <BooleanToggle value={field.value} onChange={field.onChange} />} />
            </FormField>
            <FormField label="Prorrogável" error={errors.prorrogavel?.message}>
              <Controller name="prorrogavel" control={control}
                render={({ field }) => <BooleanToggle value={field.value} onChange={field.onChange} />} />
            </FormField>
          </div>
        </div>

        {/* ── Observações ───────────────────────────────────────────────── */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-5 border-b border-border pb-4">
            <h3 className="text-sm font-semibold text-foreground">Observações</h3>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <FormField label="Data OBS" error={errors.dataObs?.message}>
              <input type="date" {...register("dataObs")} className={inputClass} />
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="OBS" required error={errors.obs?.message}>
                <textarea {...register("obs")} rows={3} placeholder="Observações adicionais..."
                  className={cn(inputClass, "resize-none")} />
              </FormField>
            </div>
          </div>
        </div>

        {/* ── Botões ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 rounded-xl border border-border bg-card px-6 py-4">
          <Link href="/convenios"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-secondary/40 px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
            <ArrowLeft className="h-4 w-4" />
            Cancelar
          </Link>
          <button type="submit" disabled={isSubmitting}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? (<><Loader2 className="h-4 w-4 animate-spin" />Salvando...</>) : (<><Save className="h-4 w-4" />Salvar Convênio</>)}
          </button>
        </div>
      </form>

      {/* ── Dialog de sucesso ──────────────────────────────────────────── */}
      {convenioSalvo && (
        <SuccessDialog
          convenio={convenioSalvo}
          onCadastrarOutro={() => { setConvenioSalvo(null); reset(); }}
          onVerConvenios={() => router.push("/convenios")}
        />
      )}
    </>
  );
}
