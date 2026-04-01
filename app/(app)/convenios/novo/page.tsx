import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NovoConvenioForm } from "@/components/convenios/novo-convenio-form";

export default function NovoConvenioPage() {
  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/convenios"
          className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Convênios
        </Link>
        <span>/</span>
        <span className="text-foreground">Novo Convênio</span>
      </div>

      {/* Cabeçalho */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">
          Cadastrar Novo Convênio
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Preencha os campos abaixo para registrar um novo convênio público.
          Os campos marcados com <span className="text-destructive">*</span> são
          obrigatórios.
        </p>
      </div>

      {/* Formulário */}
      <NovoConvenioForm />
    </div>
  );
}
