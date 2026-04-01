-- ============================================================
-- Carbon Capital — Sistema de Gestão de Convênios Públicos
-- Script DDL — Compatível com Neon Database (PostgreSQL 15+)
-- Cria APENAS as tabelas/ENUMs do módulo de convênios
-- NÃO altera nenhuma tabela existente
-- ============================================================

-- ENUMs
CREATE TYPE IF NOT EXISTS "Estado" AS ENUM (
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA',
  'MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN',
  'RO','RR','RS','SC','SE','SP','TO'
);

CREATE TYPE IF NOT EXISTS "Parceiro" AS ENUM (
  'AGEU','BR_PAGO','INST_VIDA','NEOCONSIG'
);

CREATE TYPE IF NOT EXISTS "InstituicaoFinanceira" AS ENUM (
  'C_CARD','BR_PAGO','DIGIMAIS'
);

CREATE TYPE IF NOT EXISTS "Capag" AS ENUM (
  'A_MAIS','A','B_MAIS','B','C','D','ND'
);

CREATE TYPE IF NOT EXISTS "Produto" AS ENUM (
  'ANTECIPACAO_SALARIAL','CARTAO_BENEFICIO','CARTAO_CONSIGNADO',
  'CB_ANTEC_SALARIAL','CC_ANTEC_SALARIAL','CC_CB',
  'EMPRESTIMO','EMPRESTIMO_ANTEC_SALARIAL','EMPRESTIMO_CB',
  'EMPRESTIMO_CC','EMPRESTIMO_CC_CB','TODOS'
);

CREATE TYPE IF NOT EXISTS "StatusConvenio" AS ENUM (
  'CONVENIO_ASSINADO',
  'CONVENIO_PENDENTE_ASSINATURA_PARTES',
  'CONVENIO_PENDENTE_ASSINATURA_MUNICIPIO',
  'CONVENIO_PUBLICADO_DIARIO_OFICIAL',
  'KIT_ELABORADO_PENDENTE_ASSINATURA',
  'KIT_EM_ELABORACAO',
  'KIT_ENVIADO_CREDENCIAMENTO',
  'OFICIO_ASSINADO',
  'OFICIO_CANCELADO',
  'OFICIO_ENVIADO_CREDENCIAMENTO',
  'OFICIO_PENDENTE_ASSINATURA',
  'OFICIO_PENDENTE_ELABORACAO',
  'PROTOCOLADO'
);

-- Tabela principal
CREATE TABLE IF NOT EXISTS convenios (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estado                 "Estado"                 NOT NULL,
  parceiro               "Parceiro"               NOT NULL,
  instituicao_financeira "InstituicaoFinanceira",
  capag                  "Capag",
  bancos                 VARCHAR(255),
  processadora           VARCHAR(255),
  orgao_competente       VARCHAR(255),
  decreto                BOOLEAN                  NOT NULL DEFAULT FALSE,
  produto                "Produto"                NOT NULL,
  contrato_convenio      BOOLEAN                  NOT NULL DEFAULT FALSE,
  prazo_contrato         VARCHAR(100),
  prorrogavel            BOOLEAN                  NOT NULL DEFAULT FALSE,
  data_assinatura        DATE,
  validade               DATE,
  status                 "StatusConvenio"         NOT NULL,
  data_obs               DATE,
  obs                    TEXT,
  funding                VARCHAR(255),
  tx                     NUMERIC(10, 4),
  comissao               NUMERIC(10, 4),
  criado_em              TIMESTAMPTZ              NOT NULL DEFAULT NOW(),
  atualizado_em          TIMESTAMPTZ              NOT NULL DEFAULT NOW()
);

-- Índices úteis para filtros e ordenação
CREATE INDEX IF NOT EXISTS idx_convenios_estado   ON convenios (estado);
CREATE INDEX IF NOT EXISTS idx_convenios_status   ON convenios (status);
CREATE INDEX IF NOT EXISTS idx_convenios_parceiro ON convenios (parceiro);
CREATE INDEX IF NOT EXISTS idx_convenios_criado   ON convenios (criado_em DESC);

-- Trigger para atualizar atualizado_em automaticamente
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_convenios_atualizado_em
BEFORE UPDATE ON convenios
FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
