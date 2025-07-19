-- Adicionar campos para controle de pool de tokens
ALTER TABLE tokens ADD COLUMN pool_id TEXT;
ALTER TABLE tokens ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE tokens ADD COLUMN last_used_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tokens ADD COLUMN usage_count INTEGER DEFAULT 0;

-- Adicionar campos para controle de pool de tokens JWT
ALTER TABLE jwt_tokens ADD COLUMN pool_id TEXT;
ALTER TABLE jwt_tokens ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE jwt_tokens ADD COLUMN last_used_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE jwt_tokens ADD COLUMN usage_count INTEGER DEFAULT 0;

-- Índices para otimizar consultas do pool
CREATE INDEX idx_tokens_pool_id ON tokens(pool_id);
CREATE INDEX idx_tokens_is_active ON tokens(is_active);
CREATE INDEX idx_tokens_last_used_at ON tokens(last_used_at);
CREATE INDEX idx_jwt_tokens_pool_id ON jwt_tokens(pool_id);
CREATE INDEX idx_jwt_tokens_is_active ON jwt_tokens(is_active);
CREATE INDEX idx_jwt_tokens_last_used_at ON jwt_tokens(last_used_at);

-- Tabela para controle de pool de tokens
CREATE TABLE token_pools (
  id BIGSERIAL PRIMARY KEY,
  banco TEXT NOT NULL DEFAULT 'ITAU',
  client_id TEXT NOT NULL,
  pool_size INTEGER NOT NULL DEFAULT 3,
  max_pool_size INTEGER NOT NULL DEFAULT 5,
  last_cleanup_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(banco, client_id)
);

CREATE INDEX idx_token_pools_banco_client_id ON token_pools(banco, client_id);
CREATE INDEX idx_token_pools_last_cleanup_at ON token_pools(last_cleanup_at);
