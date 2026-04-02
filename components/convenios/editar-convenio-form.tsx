"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { editarConvenioSchema, type EditarConvenioInput } from "@/lib/validations";
import { editarConvenio, type ConvenioParaEditar, type ParceiroRow } from "@/actions/convenios";
import {
  ESTADOS, INSTITUICOES_FINANCEIRAS, CAPAGS, PRODUTOS, STATUSES,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ParceiroCombobox } from "@/components/convenios/parceiro-combobox";

// ─── Helpers de estilo ────────────────────────────────────────────────────────

const inputClass =
  "w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary/50 focus:bg-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50";
const selectClass = cn(inputClass, "cursor-pointer");
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground";
const errorClass = "mt-1 text-[11px] text-destructive";

// ─── Componentes auxiliares ───────────────────────────────────────────────────

function FormField({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      {children}
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}

function BooleanToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary/40 p-1 w-fit">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          "rounded-md px-3 py-1 text-xs font-medium transition-all",
          !value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}
      >
        Não
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          "rounded-md px-3 py-1 text-xs font-medium transition-all",
          value ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}
      >
        Sim
      </button>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-5 border-b border-border pb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </div>
  );
}

// ─── Formulário de edição ─────────────────────────────────────────────────────

interface EditarConvenioFormProps {
  convenio: ConvenioParaEditar;
  parceiros: ParceiroRow[];
}

export function EditarConvenioForm({ convenio, parceiros }: EditarConvenioFormProps) {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<EditarConvenioInput>({
    resolver: zodResolver(editarConvenioSchema),
    defaultValues: {
      estado: (convenio.estado ?? undefined) as EditarConvenioInput["estado"],
      parceiro: convenio.parceiro ?? undefined,
      institucaoFinanceira: (convenio.institucaoFinanceira ?? undefined) as EditarConvenioInput["institucaoFinanceira"],
      capag: (convenio.capag ?? undefined) as EditarConvenioInput["capag"],
      bancos: convenio.bancos ?? undefined,
      processadora: convenio.processadora ?? undefined,
      orgaoCompetente: convenio.orgaoCompetente ?? undefined,
      decreto: convenio.decreto,
      produto: (convenio.produto ?? undefined) as EditarConvenioInput["produto"],
      contratoConvenio: convenio.contratoConvenio,
      prazoContrato: convenio.prazoContrato ?? undefined,
      prorrogavel: convenio.prorrogavel,
      dataAssinatura: convenio.dataAssinatura ?? undefined,
      validade: convenio.validade ?? undefined,
      status: (convenio.status ?? undefined) as EditarConvenioInput["status"],
      dataObs: convenio.dataObs ?? undefined,
      obs: convenio.obs ?? undefined,
      funding: convenio.funding ?? undefined,
      tx: convenio.tx ?? undefined,
      comissao: convenio.comissao ?? undefined,
    },
  });

  const onSubmit = async (data: EditarConvenioInput) => {
    setSalvando(true);
    const result = await editarConvenio(convenio.id, data);
    setSalvando(false);
    if (result.success) {
      toast.success("Convênio atualizado!", {
        description: "As alterações foram salvas com sucesso.",
      });
      router.push("/convenios");
      router.refresh();
    } else {
      toast.error("Erro ao atualizar convênio", { description: result.error });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* ── Identificação ─────────────────────────────────────────────── */}
      <Section title="Identificação" description="Dados de identificação do convênio">
        <FormField label="Estado" error={errors.estado?.message}>
          <select {...register("estado")} className={selectClass}>
            <option value="">Selecione um estado</option>
            {ESTADOS.map((e) => (
              <option key={e.value} value={e.value}>
                {e.value} — {e.label}
              </option>
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
          <select {...register("institucaoFinanceira")} className={selectClass}>
            <option value="">Selecione (opcional)</option>
            {INSTITUICOES_FINANCEIRAS.map((i) => (
              <option key={i.value} value={i.value}>{i.label}</option>
            ))}
          </select>
        </FormField>

        <FormField label="CAPAG" error={errors.capag?.message}>
          <select {...register("capag")} className={selectClass}>
            <option value="">Selecione (opcional)</option>
            {CAPAGS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Produto" error={errors.produto?.message}>
          <select {...register("produto")} className={selectClass}>
            <option value="">Selecione um produto</option>
            {PRODUTOS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Status" error={errors.status?.message}>
          <select {...register("status")} className={selectClass}>
            <option value="">Selecione um status</option>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </FormField>
      </Section>

      {/* ── Entidades ──────────────────────────────────────────────────── */}
      <Section title="Entidades Envolvidas">
        <FormField label="Órgão Competente" error={errors.orgaoCompetente?.message}>
          <input
            {...register("orgaoCompetente")}
            placeholder="Ex: Prefeitura Municipal de..."
            className={inputClass}
          />
        </FormField>
        <FormField label="Bancos" error={errors.bancos?.message}>
          <input
            {...register("bancos")}
            placeholder="Ex: Banco do Brasil, Caixa..."
            className={inputClass}
          />
        </FormField>
        <FormField label="Processadora" error={errors.processadora?.message}>
          <input
            {...register("processadora")}
            placeholder="Nome da processadora"
            className={inputClass}
          />
        </FormField>
        <FormField label="Funding" error={errors.funding?.message}>
          <input
            {...register("funding")}
            placeholder="Fonte de funding"
            className={inputClass}
          />
        </FormField>
      </Section>

      {/* ── Condições Contratuais ──────────────────────────────────────── */}
      <Section title="Condições Contratuais" description="Informações sobre prazos e vigência">
        <FormField label="Prazo do Contrato" error={errors.prazoContrato?.message}>
          <input
            {...register("prazoContrato")}
            placeholder="Ex: 12, 24, 36 meses"
            className={inputClass}
          />
        </FormField>
        <FormField label="Data de Assinatura" error={errors.dataAssinatura?.message}>
          <input type="date" {...register("dataAssinatura")} className={inputClass} />
        </FormField>
        <FormField label="Validade" error={errors.validade?.message}>
          <input type="date" {...register("validade")} className={inputClass} />
        </FormField>
        <FormField label="TX — Taxa (%)" error={errors.tx?.message}>
          <input
            type="number"
            step="0.0001"
            min="0"
            max="100"
            {...register("tx", {
              setValueAs: (v: string) =>
                v === "" || v === null || v === undefined ? null : parseFloat(v),
            })}
            placeholder="Ex: 1.25"
            className={inputClass}
          />
        </FormField>
        <FormField label="Comissão (%)" error={errors.comissao?.message}>
          <input
            type="number"
            step="0.0001"
            min="0"
            max="100"
            {...register("comissao", {
              setValueAs: (v: string) =>
                v === "" || v === null || v === undefined ? null : parseFloat(v),
            })}
            placeholder="Ex: 0.50"
            className={inputClass}
          />
        </FormField>
      </Section>

      {/* ── Características ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-5 border-b border-border pb-4">
          <h3 className="text-sm font-semibold text-foreground">Características</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Propriedades booleanas do convênio
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <FormField label="Decreto" error={errors.decreto?.message}>
            <Controller
              name="decreto"
              control={control}
              render={({ field }) => (
                <BooleanToggle value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>
          <FormField label="Contrato de Convênio" error={errors.contratoConvenio?.message}>
            <Controller
              name="contratoConvenio"
              control={control}
              render={({ field }) => (
                <BooleanToggle value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>
          <FormField label="Prorrogável" error={errors.prorrogavel?.message}>
            <Controller
              name="prorrogavel"
              control={control}
              render={({ field }) => (
                <BooleanToggle value={field.value} onChange={field.onChange} />
              )}
            />
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
            <FormField label="OBS" error={errors.obs?.message}>
              <textarea
                {...register("obs")}
                rows={3}
                placeholder="Observações adicionais..."
                className={cn(inputClass, "resize-none")}
              />
            </FormField>
          </div>
        </div>
      </div>

      {/* ── Botões ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-6 py-4">
        <Link
          href="/convenios"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-secondary/40 px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancelar
        </Link>

        <button
          type="submit"
          disabled={salvando || !isDirty}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {salvando ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Salvar Alterações
            </>
          )}
        </button>
      </div>
    </form>
  );
}
