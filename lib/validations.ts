import { z } from "zod";

// ─── Enums Zod (espelham o Prisma schema) ──────────────────────────────────────

const enumMsg = { message: "Selecione uma das opções" };

export const EstadoEnum = z.enum([
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA",
  "MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN",
  "RO","RR","RS","SC","SE","SP","TO",
], enumMsg);

// ParceiroEnum removido — parceiro agora é string livre (tabela cp_parceiros)

export const InstituicaoFinanceiraEnum = z.enum([
  "C_CARD","BR_PAGO","DIGIMAIS",
], enumMsg);

export const CapagEnum = z.enum([
  "A_MAIS","A","B_MAIS","B","C","D","ND",
], enumMsg);

export const ProdutoEnum = z.enum([
  "ANTECIPACAO_SALARIAL","CARTAO_BENEFICIO","CARTAO_CONSIGNADO",
  "CB_ANTEC_SALARIAL","CC_ANTEC_SALARIAL","CC_CB",
  "EMPRESTIMO","EMPRESTIMO_ANTEC_SALARIAL","EMPRESTIMO_CB",
  "EMPRESTIMO_CC","EMPRESTIMO_CC_CB","TODOS",
], enumMsg);

export const StatusConvenioEnum = z.enum([
  "CONVENIO_ASSINADO",
  "CONVENIO_PENDENTE_ASSINATURA_PARTES",
  "CONVENIO_PENDENTE_ASSINATURA_MUNICIPIO",
  "CONVENIO_PUBLICADO_DIARIO_OFICIAL",
  "KIT_ELABORADO_PENDENTE_ASSINATURA",
  "KIT_EM_ELABORACAO",
  "KIT_ENVIADO_CREDENCIAMENTO",
  "OFICIO_ASSINADO",
  "OFICIO_CANCELADO",
  "OFICIO_ENVIADO_CREDENCIAMENTO",
  "OFICIO_PENDENTE_ASSINATURA",
  "OFICIO_PENDENTE_ELABORACAO",
  "PROTOCOLADO",
], enumMsg);

// ─── Schema principal de criação de convênio ──────────────────────────────────

export const criarConvenioSchema = z.object({
  estado: EstadoEnum.optional().nullable(),
  parceiro: z.string().optional().nullable(),
  institucaoFinanceira: InstituicaoFinanceiraEnum.optional().nullable(),
  capag: CapagEnum.optional().nullable(),
  bancos: z.string().max(255).optional().nullable(),
  processadora: z.string().max(255).optional().nullable(),
  orgaoCompetente: z.string().max(255).optional().nullable(),
  decreto: z.boolean(),
  produto: ProdutoEnum.optional().nullable(),
  contratoConvenio: z.boolean(),
  prazoContrato: z.string().max(100).optional().nullable(),
  prorrogavel: z.boolean(),
  dataAssinatura: z.string().optional().nullable(),
  validade: z.string().optional().nullable(),
  status: StatusConvenioEnum.optional().nullable(),
  dataObs: z.string().optional().nullable(),
  obs: z.string().min(1, "Observação é obrigatória"),
  funding: z.string().max(255).optional().nullable(),
  tx: z.number().min(0).max(100).optional().nullable(),
  comissao: z.number().min(0).max(100).optional().nullable(),
});

export type CriarConvenioInput = z.infer<typeof criarConvenioSchema>;

// ─── Schema de edição (OBS obrigatória) ──────────────────────────────────────

export const editarConvenioSchema = criarConvenioSchema;

export type EditarConvenioInput = z.infer<typeof editarConvenioSchema>;

// ─── Schema de filtros/listagem ───────────────────────────────────────────────

export const filtrosConvenioSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(5).max(100).default(20),
  search: z.string().optional(),
  status: StatusConvenioEnum.optional(),
  estado: EstadoEnum.optional(),
  parceiro: z.string().optional(),
});

export type FiltrosConvenioInput = z.infer<typeof filtrosConvenioSchema>;
