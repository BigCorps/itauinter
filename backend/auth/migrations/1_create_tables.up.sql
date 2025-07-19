CREATE TABLE credentials (
  id BIGSERIAL PRIMARY KEY,
  client_id TEXT UNIQUE NOT NULL,
  client_secret TEXT NOT NULL,
  certificate_content TEXT NOT NULL,
  private_key_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tokens (
  id BIGSERIAL PRIMARY KEY,
  client_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  token_type TEXT NOT NULL,
  expires_in INTEGER NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE jwt_credentials (
  id BIGSERIAL PRIMARY KEY,
  client_id TEXT UNIQUE NOT NULL,
  private_key_jwt TEXT NOT NULL,
  certificate_content TEXT NOT NULL,
  private_key_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE jwt_tokens (
  id BIGSERIAL PRIMARY KEY,
  client_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  token_type TEXT NOT NULL,
  expires_in INTEGER NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_credentials_client_id ON credentials(client_id);
CREATE INDEX idx_tokens_client_id ON tokens(client_id);
CREATE INDEX idx_tokens_generated_at ON tokens(generated_at);
CREATE INDEX idx_jwt_credentials_client_id ON jwt_credentials(client_id);
CREATE INDEX idx_jwt_tokens_client_id ON jwt_tokens(client_id);
CREATE INDEX idx_jwt_tokens_generated_at ON jwt_tokens(generated_at);
