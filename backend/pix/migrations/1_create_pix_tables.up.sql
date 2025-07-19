CREATE TABLE pix_transactions (
  id BIGSERIAL PRIMARY KEY,
  client_id TEXT NOT NULL,
  id_transacao TEXT NOT NULL,
  status TEXT NOT NULL,
  valor DOUBLE PRECISION NOT NULL,
  chave_destinatario TEXT NOT NULL,
  tipo_chave TEXT NOT NULL,
  descricao TEXT,
  nome_destinatario TEXT,
  end_to_end_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE pix_receives (
  id BIGSERIAL PRIMARY KEY,
  client_id TEXT NOT NULL,
  tx_id TEXT NOT NULL,
  qr_code TEXT NOT NULL,
  qr_code_base64 TEXT NOT NULL,
  valor DOUBLE PRECISION,
  chave_recebimento TEXT NOT NULL,
  tipo_chave TEXT NOT NULL,
  descricao TEXT,
  vencimento TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pix_transactions_client_id ON pix_transactions(client_id);
CREATE INDEX idx_pix_transactions_id_transacao ON pix_transactions(id_transacao);
CREATE INDEX idx_pix_receives_client_id ON pix_receives(client_id);
CREATE INDEX idx_pix_receives_tx_id ON pix_receives(tx_id);
