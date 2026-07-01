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

-- 3. Políticas de acesso (cada usuário só acessa seus dados)
CREATE POLICY "select_own" ON avaliacoes
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "insert_own" ON avaliacoes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own" ON avaliacoes
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own" ON avaliacoes
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 4. Índices para performance
CREATE INDEX idx_avaliacoes_user    ON avaliacoes(user_id);
CREATE INDEX idx_avaliacoes_grupo   ON avaliacoes(grupo_id);
CREATE INDEX idx_avaliacoes_created ON avaliacoes(created_at DESC);
