// Tipos espelhados do schema Prisma (evita dependência direta do client gerado)
export type Estado = "AC"|"AL"|"AM"|"AP"|"BA"|"CE"|"DF"|"ES"|"GO"|"MA"|"MG"|"MS"|"MT"|"PA"|"PB"|"PE"|"PI"|"PR"|"RJ"|"RN"|"RO"|"RR"|"RS"|"SC"|"SE"|"SP"|"TO";
export type Parceiro = "AGEU"|"BR_PAGO"|"INST_VIDA"|"NEOCONSIG";
export type InstituicaoFinanceira = "C_CARD"|"BR_PAGO"|"DIGIMAIS";
export type Capag = "A_MAIS"|"A"|"B_MAIS"|"B"|"C"|"D"|"ND";
export type Produto = "ANTECIPACAO_SALARIAL"|"CARTAO_BENEFICIO"|"CARTAO_CONSIGNADO"|"CB_ANTEC_SALARIAL"|"CC_ANTEC_SALARIAL"|"CC_CB"|"EMPRESTIMO"|"EMPRESTIMO_ANTEC_SALARIAL"|"EMPRESTIMO_CB"|"EMPRESTIMO_CC"|"EMPRESTIMO_CC_CB"|"TODOS";
export type StatusConvenio = "CONVENIO_ASSINADO"|"CONVENIO_PENDENTE_ASSINATURA_PARTES"|"CONVENIO_PENDENTE_ASSINATURA_MUNICIPIO"|"CONVENIO_PUBLICADO_DIARIO_OFICIAL"|"KIT_ELABORADO_PENDENTE_ASSINATURA"|"KIT_EM_ELABORACAO"|"KIT_ENVIADO_CREDENCIAMENTO"|"OFICIO_ASSINADO"|"OFICIO_CANCELADO"|"OFICIO_ENVIADO_CREDENCIAMENTO"|"OFICIO_PENDENTE_ASSINATURA"|"OFICIO_PENDENTE_ELABORACAO"|"PROTOCOLADO";

// ─── Labels de exibição ───────────────────────────────────────────────────────

export const ESTADO_LABELS: Record<Estado, string> = {
  AC: "Acre", AL: "Alagoas", AM: "Amazonas", AP: "Amapá",
  BA: "Bahia", CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo",
  GO: "Goiás", MA: "Maranhão", MG: "Minas Gerais", MS: "Mato Grosso do Sul",
  MT: "Mato Grosso", PA: "Pará", PB: "Paraíba", PE: "Pernambuco",
  PI: "Piauí", PR: "Paraná", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
  RO: "Rondônia", RR: "Roraima", RS: "Rio Grande do Sul",
  SC: "Santa Catarina", SE: "Sergipe", SP: "São Paulo", TO: "Tocantins",
};

export const PARCEIRO_LABELS: Record<Parceiro, string> = {
  AGEU: "AGEU",
  BR_PAGO: "BR PAGO",
  INST_VIDA: "INST VIDA",
  NEOCONSIG: "NEOCONSIG",
};

export const IF_LABELS: Record<InstituicaoFinanceira, string> = {
  C_CARD: "C CARD",
  BR_PAGO: "BR PAGO",
  DIGIMAIS: "DIGIMAIS",
};

export const CAPAG_LABELS: Record<Capag, string> = {
  A_MAIS: "A+",
  A: "A",
  B_MAIS: "B+",
  B: "B",
  C: "C",
  D: "D",
  ND: "ND",
};

export const PRODUTO_LABELS: Record<Produto, string> = {
  ANTECIPACAO_SALARIAL: "Antecipação Salarial",
  CARTAO_BENEFICIO: "Cartão Benefício",
  CARTAO_CONSIGNADO: "Cartão Consignado",
  CB_ANTEC_SALARIAL: "CB / Antec. Salarial",
  CC_ANTEC_SALARIAL: "CC / Antec. Salarial",
  CC_CB: "CC / CB",
  EMPRESTIMO: "Empréstimo",
  EMPRESTIMO_ANTEC_SALARIAL: "Empréstimo / Antec. Salarial",
  EMPRESTIMO_CB: "Empréstimo / CB",
  EMPRESTIMO_CC: "Empréstimo / CC",
  EMPRESTIMO_CC_CB: "Empréstimo / CC / CB",
  TODOS: "Todos",
};

export const STATUS_LABELS: Record<StatusConvenio, string> = {
  CONVENIO_ASSINADO: "Convênio assinado",
  CONVENIO_PENDENTE_ASSINATURA_PARTES: "Convênio pendente assinatura das partes",
  CONVENIO_PENDENTE_ASSINATURA_MUNICIPIO: "Convênio pendente assinatura município",
  CONVENIO_PUBLICADO_DIARIO_OFICIAL: "Convênio publicado em Diário Oficial",
  KIT_ELABORADO_PENDENTE_ASSINATURA: "Kit elaborado pendente assinatura",
  KIT_EM_ELABORACAO: "Kit em elaboração",
  KIT_ENVIADO_CREDENCIAMENTO: "Kit enviado para credenciamento",
  OFICIO_ASSINADO: "Ofício assinado",
  OFICIO_CANCELADO: "Ofício cancelado",
  OFICIO_ENVIADO_CREDENCIAMENTO: "Ofício enviado para credenciamento",
  OFICIO_PENDENTE_ASSINATURA: "Ofício pendente assinatura",
  OFICIO_PENDENTE_ELABORACAO: "Ofício pendente elaboração",
  PROTOCOLADO: "Protocolado",
};

// ─── Cores de badge por status ────────────────────────────────────────────────

export const STATUS_COLORS: Record<StatusConvenio, string> = {
  CONVENIO_ASSINADO: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  CONVENIO_PENDENTE_ASSINATURA_PARTES: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  CONVENIO_PENDENTE_ASSINATURA_MUNICIPIO: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  CONVENIO_PUBLICADO_DIARIO_OFICIAL: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  KIT_ELABORADO_PENDENTE_ASSINATURA: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  KIT_EM_ELABORACAO: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  KIT_ENVIADO_CREDENCIAMENTO: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  OFICIO_ASSINADO: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  OFICIO_CANCELADO: "bg-red-500/15 text-red-400 border-red-500/30",
  OFICIO_ENVIADO_CREDENCIAMENTO: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  OFICIO_PENDENTE_ASSINATURA: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  OFICIO_PENDENTE_ELABORACAO: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  PROTOCOLADO: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

// ─── Arrays para Selects ──────────────────────────────────────────────────────

export const ESTADOS = Object.entries(ESTADO_LABELS).map(([value, label]) => ({
  value: value as Estado, label,
}));

export const PARCEIROS = Object.entries(PARCEIRO_LABELS).map(([value, label]) => ({
  value: value as Parceiro, label,
}));

export const INSTITUICOES_FINANCEIRAS = Object.entries(IF_LABELS).map(([value, label]) => ({
  value: value as InstituicaoFinanceira, label,
}));

export const CAPAGS = Object.entries(CAPAG_LABELS).map(([value, label]) => ({
  value: value as Capag, label,
}));

export const PRODUTOS = Object.entries(PRODUTO_LABELS).map(([value, label]) => ({
  value: value as Produto, label,
}));

export const STATUSES = Object.entries(STATUS_LABELS).map(([value, label]) => ({
  value: value as StatusConvenio, label,
}));
