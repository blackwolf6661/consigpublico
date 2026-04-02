import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NovoConvenioForm } from "@/components/convenios/novo-convenio-form";
import { listarParceiros } from "@/actions/convenios";

export default async function NovoConvenioPage() {
  const parceiros = await listarParceiros();

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/convenios" className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Convênios
        </Link>
        <span>/</span>
        <span className="text-foreground">Novo Convênio</span>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Cadastrar Novo Convênio</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Preencha os campos abaixo para registrar um novo convênio público.
          O campo marcado com <span className="text-destructive">*</span> é obrigatório.
        </p>
      </div>

      <NovoConvenioForm parceiros={parceiros} />
    </div>
  );
}
