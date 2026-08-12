-- ══════════════════════════════════════════════════════════════════════
-- Marcador de Consumo Alimentar — Schema do Banco de Dados
-- Execute este SQL no SQL Editor do Supabase (supabase.com → seu projeto → SQL Editor)
-- ══════════════════════════════════════════════════════════════════════

-- 1. Criar tabela principal
CREATE TABLE avaliacoes (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  grupo_id      TEXT NOT NULL,
  familia       TEXT NOT NULL,
  pessoa_nome   TEXT,
  pessoa_num    INT NOT NULL,
  total_familia INT NOT NULL,
  faixa         TEXT NOT NULL CHECK (faixa IN ('0-6', '6-23', '2+')),
  sexo          CHAR(1) NOT NULL CHECK (sexo IN ('F', 'M')),
  respostas     JSONB NOT NULL DEFAULT '{}',
  lancada       BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. Habilitar Row Level Security
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;

-- 3. Acesso compartilhado pelos dois perfis do aplicativo.
-- AVISO: a escolha de perfil não autentica a identidade da pessoa.
GRANT SELECT, INSERT, UPDATE, DELETE ON avaliacoes TO anon;

CREATE POLICY "select_shared_profiles" ON avaliacoes
  FOR SELECT TO anon
  USING (user_id IN (
    'b4d5b1a2-a7e7-47ad-9f2a-b6b1abede8af'::uuid,
    'db66d658-c489-41a0-8f00-0c3831e10742'::uuid
  ));

CREATE POLICY "insert_shared_profiles" ON avaliacoes
  FOR INSERT TO anon
  WITH CHECK (user_id IN (
    'b4d5b1a2-a7e7-47ad-9f2a-b6b1abede8af'::uuid,
    'db66d658-c489-41a0-8f00-0c3831e10742'::uuid
  ));

CREATE POLICY "update_shared_profiles" ON avaliacoes
  FOR UPDATE TO anon
  USING (user_id IN (
    'b4d5b1a2-a7e7-47ad-9f2a-b6b1abede8af'::uuid,
    'db66d658-c489-41a0-8f00-0c3831e10742'::uuid
  ))
  WITH CHECK (user_id IN (
    'b4d5b1a2-a7e7-47ad-9f2a-b6b1abede8af'::uuid,
    'db66d658-c489-41a0-8f00-0c3831e10742'::uuid
  ));

CREATE POLICY "delete_shared_profiles" ON avaliacoes
  FOR DELETE TO anon
  USING (user_id IN (
    'b4d5b1a2-a7e7-47ad-9f2a-b6b1abede8af'::uuid,
    'db66d658-c489-41a0-8f00-0c3831e10742'::uuid
  ));

-- 4. Índices para performance
CREATE INDEX idx_avaliacoes_user    ON avaliacoes(user_id);
CREATE INDEX idx_avaliacoes_grupo   ON avaliacoes(grupo_id);
CREATE INDEX idx_avaliacoes_created ON avaliacoes(created_at DESC);
