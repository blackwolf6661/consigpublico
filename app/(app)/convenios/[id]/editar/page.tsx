import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buscarConvenio } from "@/actions/convenios";
import { EditarConvenioForm } from "@/components/convenios/editar-convenio-form";
import {
  ESTADO_LABELS,
  PARCEIRO_LABELS,
  PRODUTO_LABELS,
} from "@/lib/constants";
import type { Estado, Parceiro, Produto } from "@/lib/constants";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarConvenioPage({ params }: PageProps) {
  const { id } = await params;
  const convenio = await buscarConvenio(id);

  if (!convenio) notFound();

  const estadoLabel  = ESTADO_LABELS[convenio.estado as Estado]   ?? convenio.estado;
  const parceiroLabel = PARCEIRO_LABELS[convenio.parceiro as Parceiro] ?? convenio.parceiro;
  const produtoLabel  = PRODUTO_LABELS[convenio.produto as Produto]  ?? convenio.produto;

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        <Link
          href="/convenios"
          className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Convênios
        </Link>
        <span>/</span>
        <span className="text-foreground truncate max-w-[280px]" title={convenio.orgaoCompetente ?? convenio.id}>
          {convenio.orgaoCompetente ?? `${estadoLabel} · ${parceiroLabel}`}
        </span>
        <span>/</span>
        <span className="text-foreground">Editar</span>
      </div>

      {/* Cabeçalho */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Editar Convênio</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {estadoLabel} &middot; {parceiroLabel} &middot; {produtoLabel}
        </p>
      </div>

      {/* Formulário */}
      <EditarConvenioForm convenio={convenio} />
    </div>
  );
}
