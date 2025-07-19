CREATE TABLE credentials (
  id BIGSERIAL PRIMARY KEY,
  banco TEXT NOT NULL DEFAULT 'ITAU',
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  certificate_content TEXT NOT NULL,
  private_key_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(banco, client_id)
);

CREATE TABLE tokens (
  id BIGSERIAL PRIMARY KEY,
  banco TEXT NOT NULL DEFAULT 'ITAU',
  client_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  token_type TEXT NOT NULL,
  expires_in INTEGER NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE jwt_credentials (
  id BIGSERIAL PRIMARY KEY,
  banco TEXT NOT NULL DEFAULT 'ITAU',
  client_id TEXT NOT NULL,
  private_key_jwt TEXT NOT NULL,
  certificate_content TEXT NOT NULL,
  private_key_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(banco, client_id)
);

CREATE TABLE jwt_tokens (
  id BIGSERIAL PRIMARY KEY,
  banco TEXT NOT NULL DEFAULT 'ITAU',
  client_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  token_type TEXT NOT NULL,
  expires_in INTEGER NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_credentials_banco_client_id ON credentials(banco, client_id);
CREATE INDEX idx_tokens_banco_client_id ON tokens(banco, client_id);
CREATE INDEX idx_tokens_generated_at ON tokens(generated_at);
CREATE INDEX idx_jwt_credentials_banco_client_id ON jwt_credentials(banco, client_id);
CREATE INDEX idx_jwt_tokens_banco_client_id ON jwt_tokens(banco, client_id);
CREATE INDEX idx_jwt_tokens_generated_at ON jwt_tokens(generated_at);
