"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { criarConvenioSchema, editarConvenioSchema, type CriarConvenioInput } from "@/lib/validations";
import type { StatusConvenio, Estado, Parceiro } from "@/lib/constants";
import {
  ESTADO_LABELS, PARCEIRO_LABELS, PRODUTO_LABELS, STATUS_LABELS,
  IF_LABELS, CAPAG_LABELS,
} from "@/lib/constants";

// ─── Tipos de resposta ────────────────────────────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type ConvenioComId = Awaited<ReturnType<typeof listarConvenios>>["convenios"][number];

// ─── Criar Convênio ───────────────────────────────────────────────────────────

export type ConvenioSalvo = {
  id: string;
  estado: string | null;
  parceiro: string | null;
  produto: string | null;
  status: string | null;
  capag: string | null;
  tx: string | null;
  comissao: string | null;
  criadoEm: string;
};

export async function criarConvenio(
  input: CriarConvenioInput
): Promise<ActionResult<ConvenioSalvo>> {
  try {
    const dados = criarConvenioSchema.parse(input);

    const convenio = await prisma.convenio.create({
      data: {
        estado: dados.estado ?? null,
        parceiro: dados.parceiro ?? null,
        institucaoFinanceira: dados.institucaoFinanceira ?? undefined,
        capag: dados.capag ?? undefined,
        bancos: dados.bancos ?? null,
        processadora: dados.processadora ?? null,
        orgaoCompetente: dados.orgaoCompetente ?? null,
        decreto: dados.decreto,
        produto: dados.produto ?? null,
        contratoConvenio: dados.contratoConvenio,
        prazoContrato: dados.prazoContrato ?? null,
        prorrogavel: dados.prorrogavel,
        dataAssinatura: dados.dataAssinatura ? new Date(dados.dataAssinatura) : null,
        validade: dados.validade ? new Date(dados.validade) : null,
        status: dados.status ?? null,
        dataObs: dados.dataObs ? new Date(dados.dataObs) : null,
        obs: dados.obs ?? null,
        funding: dados.funding ?? null,
        tx: dados.tx != null ? dados.tx : null,
        comissao: dados.comissao != null ? dados.comissao : null,
      },
    });

    revalidatePath("/");
    revalidatePath("/convenios");

    return {
      success: true,
      data: {
        id: convenio.id,
        estado: convenio.estado,
        parceiro: convenio.parceiro,
        produto: convenio.produto,
        status: convenio.status,
        capag: convenio.capag ?? null,
        tx: convenio.tx != null ? convenio.tx.toString() : null,
        comissao: convenio.comissao != null ? convenio.comissao.toString() : null,
        criadoEm: convenio.criadoEm.toISOString(),
      },
    };
  } catch (err) {
    console.error("[criarConvenio]", err);
    return { success: false, error: "Erro ao salvar o convênio. Tente novamente." };
  }
}

// ─── Listar Convênios (paginado) ──────────────────────────────────────────────

export async function listarConvenios(params: {
  page?: number;
  perPage?: number;
  search?: string;
  status?: StatusConvenio;
  estado?: Estado;
  parceiro?: Parceiro;
}) {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 20;
  const skip = (page - 1) * perPage;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {};

  if (params.status) where.status = params.status;
  if (params.estado) where.estado = params.estado;
  if (params.parceiro) where.parceiro = params.parceiro;

  if (params.search) {
    const q = params.search.trim();
    const qLower = q.toLowerCase();

    // Enums cujos labels batem com o termo buscado
    const matchingEstados = (Object.entries(ESTADO_LABELS) as [Estado, string][])
      .filter(([k, v]) => k.toLowerCase().includes(qLower) || v.toLowerCase().includes(qLower))
      .map(([k]) => k);

    const matchingParceiros = (Object.entries(PARCEIRO_LABELS) as [Parceiro, string][])
      .filter(([k, v]) => k.toLowerCase().includes(qLower) || v.toLowerCase().includes(qLower))
      .map(([k]) => k);

    const matchingProdutos = Object.entries(PRODUTO_LABELS)
      .filter(([k, v]) => k.toLowerCase().includes(qLower) || v.toLowerCase().includes(qLower))
      .map(([k]) => k);

    const matchingStatuses = Object.entries(STATUS_LABELS)
      .filter(([k, v]) => k.toLowerCase().includes(qLower) || v.toLowerCase().includes(qLower))
      .map(([k]) => k);

    const matchingIFs = Object.entries(IF_LABELS)
      .filter(([k, v]) => k.toLowerCase().includes(qLower) || v.toLowerCase().includes(qLower))
      .map(([k]) => k);

    const matchingCapags = Object.entries(CAPAG_LABELS)
      .filter(([k, v]) => k.toLowerCase().includes(qLower) || v.toLowerCase().includes(qLower))
      .map(([k]) => k);

    // Booleanos: "sim" / "s" → true, "não" / "nao" / "n" → false
    const boolTrue  = ["sim", "s", "yes"].some((w) => w.startsWith(qLower));
    const boolFalse = ["não", "nao", "n", "no"].some((w) => w.startsWith(qLower));

    const orClauses: object[] = [
      // Campos de texto livre
      { orgaoCompetente: { contains: q, mode: "insensitive" } },
      { bancos:          { contains: q, mode: "insensitive" } },
      { processadora:    { contains: q, mode: "insensitive" } },
      { funding:         { contains: q, mode: "insensitive" } },
      { obs:             { contains: q, mode: "insensitive" } },
      { prazoContrato:   { contains: q, mode: "insensitive" } },
      // Enums por label ou valor
      ...(matchingEstados.length   ? [{ estado:               { in: matchingEstados   } }] : []),
      ...(matchingParceiros.length ? [{ parceiro:             { in: matchingParceiros } }] : []),
      ...(matchingProdutos.length  ? [{ produto:              { in: matchingProdutos  } }] : []),
      ...(matchingStatuses.length  ? [{ status:               { in: matchingStatuses  } }] : []),
      ...(matchingIFs.length       ? [{ institucaoFinanceira: { in: matchingIFs       } }] : []),
      ...(matchingCapags.length    ? [{ capag:                { in: matchingCapags    } }] : []),
      // Booleanos
      ...(boolTrue  ? [{ decreto: true  }, { contratoConvenio: true  }, { prorrogavel: true  }] : []),
      ...(boolFalse ? [{ decreto: false }, { contratoConvenio: false }, { prorrogavel: false }] : []),
    ];

    where.OR = orClauses;
  }

  const [convenios, total] = await Promise.all([
    prisma.convenio.findMany({
      where,
      orderBy: { criadoEm: "desc" },
      skip,
      take: perPage,
    }),
    prisma.convenio.count({ where }),
  ]);

  return {
    convenios,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

// ─── Excluir Convênio ─────────────────────────────────────────────────────────

export async function excluirConvenio(id: string): Promise<ActionResult> {
  try {
    await prisma.convenio.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/convenios");
    return { success: true, data: undefined };
  } catch (err) {
    console.error("[excluirConvenio]", err);
    return { success: false, error: "Erro ao excluir o convênio. Tente novamente." };
  }
}

// ─── Buscar Convênio por ID ───────────────────────────────────────────────────

export type ConvenioParaEditar = {
  id: string;
  estado: string | null;
  parceiro: string | null;
  institucaoFinanceira: string | null;
  capag: string | null;
  bancos: string | null;
  processadora: string | null;
  orgaoCompetente: string | null;
  decreto: boolean;
  produto: string | null;
  contratoConvenio: boolean;
  prazoContrato: string | null;
  prorrogavel: boolean;
  dataAssinatura: string | null; // "YYYY-MM-DD"
  validade: string | null;       // "YYYY-MM-DD"
  status: string | null;
  dataObs: string | null;        // "YYYY-MM-DD"
  obs: string | null;
  funding: string | null;
  tx: number | null;
  comissao: number | null;
};

function toDateStr(d: Date | null | undefined): string | null {
  if (!d) return null;
  return new Date(d).toISOString().split("T")[0];
}

export async function buscarConvenio(id: string): Promise<ConvenioParaEditar | null> {
  const c = await prisma.convenio.findUnique({ where: { id } });
  if (!c) return null;
  return {
    id: c.id,
    estado: c.estado,
    parceiro: c.parceiro,
    institucaoFinanceira: c.institucaoFinanceira ?? null,
    capag: c.capag ?? null,
    bancos: c.bancos ?? null,
    processadora: c.processadora ?? null,
    orgaoCompetente: c.orgaoCompetente ?? null,
    decreto: c.decreto,
    produto: c.produto,
    contratoConvenio: c.contratoConvenio,
    prazoContrato: c.prazoContrato ?? null,
    prorrogavel: c.prorrogavel,
    dataAssinatura: toDateStr(c.dataAssinatura),
    validade: toDateStr(c.validade),
    status: c.status,
    dataObs: toDateStr(c.dataObs),
    obs: c.obs ?? null,
    funding: c.funding ?? null,
    tx: c.tx != null ? Number(c.tx) : null,
    comissao: c.comissao != null ? Number(c.comissao) : null,
  };
}

// ─── Editar Convênio ──────────────────────────────────────────────────────────

export async function editarConvenio(
  id: string,
  input: CriarConvenioInput
): Promise<ActionResult<ConvenioSalvo>> {
  try {
    const dados = editarConvenioSchema.parse(input);

    const convenio = await prisma.convenio.update({
      where: { id },
      data: {
        estado: dados.estado ?? null,
        parceiro: dados.parceiro ?? null,
        institucaoFinanceira: dados.institucaoFinanceira ?? undefined,
        capag: dados.capag ?? undefined,
        bancos: dados.bancos ?? null,
        processadora: dados.processadora ?? null,
        orgaoCompetente: dados.orgaoCompetente ?? null,
        decreto: dados.decreto,
        produto: dados.produto ?? null,
        contratoConvenio: dados.contratoConvenio,
        prazoContrato: dados.prazoContrato ?? null,
        prorrogavel: dados.prorrogavel,
        dataAssinatura: dados.dataAssinatura ? new Date(dados.dataAssinatura) : null,
        validade: dados.validade ? new Date(dados.validade) : null,
        status: dados.status ?? null,
        dataObs: dados.dataObs ? new Date(dados.dataObs) : null,
        obs: dados.obs ?? null,
        funding: dados.funding ?? null,
        tx: dados.tx != null ? dados.tx : null,
        comissao: dados.comissao != null ? dados.comissao : null,
      },
    });

    revalidatePath("/");
    revalidatePath("/convenios");

    return {
      success: true,
      data: {
        id: convenio.id,
        estado: convenio.estado,
        parceiro: convenio.parceiro,
        produto: convenio.produto,
        status: convenio.status,
        capag: convenio.capag ?? null,
        tx: convenio.tx != null ? convenio.tx.toString() : null,
        comissao: convenio.comissao != null ? convenio.comissao.toString() : null,
        criadoEm: convenio.criadoEm.toISOString(),
      },
    };
  } catch (err) {
    console.error("[editarConvenio]", err);
    return { success: false, error: "Erro ao atualizar o convênio. Tente novamente." };
  }
}

// ─── Estatísticas para o Dashboard ───────────────────────────────────────────

export type DadosMensais = {
  mes: string;
  label: string;
  total: number;
  assinados: number;
  publicados: number;
};

const PT_MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

export async function getEstatisticasDashboard() {
  // Janela de 6 meses para o gráfico
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [
    totalConvenios,
    conveniosAssinados,
    conveniosPendentes,
    conveniosPublicados,
    conveniosCancelados,
    // Campos booleanos
    comContrato,
    semContrato,
    prorrogaveis,
    comDecretoCount,
    // Distribuições
    porStatus,
    porEstado,
    porParceiro,
    porProduto,
    // Registros recentes para o gráfico mensal
    registrosRecentes,
  ] = await Promise.all([
    prisma.convenio.count(),
    prisma.convenio.count({ where: { status: "CONVENIO_ASSINADO" } }),
    prisma.convenio.count({
      where: {
        status: {
          in: [
            "CONVENIO_PENDENTE_ASSINATURA_PARTES",
            "CONVENIO_PENDENTE_ASSINATURA_MUNICIPIO",
            "OFICIO_PENDENTE_ASSINATURA",
            "OFICIO_PENDENTE_ELABORACAO",
            "KIT_ELABORADO_PENDENTE_ASSINATURA",
            "KIT_EM_ELABORACAO",
          ],
        },
      },
    }),
    prisma.convenio.count({ where: { status: "CONVENIO_PUBLICADO_DIARIO_OFICIAL" } }),
    prisma.convenio.count({ where: { status: "OFICIO_CANCELADO" } }),
    prisma.convenio.count({ where: { contratoConvenio: true } }),
    prisma.convenio.count({ where: { contratoConvenio: false } }),
    prisma.convenio.count({ where: { prorrogavel: true } }),
    prisma.convenio.count({ where: { decreto: true } }),
    // Por status — ordenado por volume decrescente
    prisma.convenio.groupBy({
      by: ["status"],
      _count: { _all: true },
      orderBy: { _count: { status: "desc" } },
    }),
    // Top 5 estados
    prisma.convenio.groupBy({
      by: ["estado"],
      _count: { _all: true },
      take: 5,
      orderBy: { _count: { estado: "desc" } },
    }),
    // Por parceiro (todos)
    prisma.convenio.groupBy({
      by: ["parceiro"],
      _count: { _all: true },
      orderBy: { _count: { parceiro: "desc" } },
    }),
    // Top 5 produtos
    prisma.convenio.groupBy({
      by: ["produto"],
      _count: { _all: true },
      take: 5,
      orderBy: { _count: { produto: "desc" } },
    }),
    // Registros dos últimos 6 meses para o gráfico de linha
    prisma.convenio.findMany({
      where: { criadoEm: { gte: sixMonthsAgo } },
      select: { criadoEm: true, status: true },
      orderBy: { criadoEm: "asc" },
    }),
  ]);

  // Agregar por mês em JS (garante 6 pontos mesmo com meses sem dados)
  const now = new Date();
  const dadosMensais: DadosMensais[] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const registros = registrosRecentes.filter((r) => {
      const rd = new Date(r.criadoEm);
      return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth();
    });
    return {
      mes: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: PT_MONTHS[d.getMonth()],
      total: registros.length,
      assinados: registros.filter((r) => r.status === "CONVENIO_ASSINADO").length,
      publicados: registros.filter((r) => r.status === "CONVENIO_PUBLICADO_DIARIO_OFICIAL").length,
    };
  });

  return {
    totalConvenios,
    conveniosAssinados,
    conveniosPendentes,
    conveniosPublicados,
    conveniosCancelados,
    comContrato,
    semContrato,
    prorrogaveis,
    comDecretoCount,
    porStatus,
    porEstado,
    porParceiro,
    porProduto,
    dadosMensais,
  };
}

// ─── Parceiros ───────────────────────────────────────────────────────────────

export type ParceiroRow = { id: string; nome: string; label: string };

export async function listarParceiros(): Promise<ParceiroRow[]> {
  const rows = await prisma.parceiroOption.findMany({
    orderBy: { criadoEm: "asc" },
    select: { id: true, nome: true, label: true },
  });
  return rows;
}

export async function criarParceiro(
  label: string
): Promise<ActionResult<ParceiroRow>> {
  const labelTrimmed = label.trim();
  if (!labelTrimmed) return { success: false, error: "Nome inválido" };

  // Gera slug: remove acentos, converte espaços em _, uppercase
  const nome = labelTrimmed
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .toUpperCase();

  try {
    const row = await prisma.parceiroOption.upsert({
      where: { nome },
      update: { label: labelTrimmed },
      create: { nome, label: labelTrimmed },
    });
    return { success: true, data: { id: row.id, nome: row.nome, label: row.label } };
  } catch {
    return { success: false, error: "Parceiro já existe" };
  }
}
