CREATE TABLE boletos (
  id BIGSERIAL PRIMARY KEY,
  banco TEXT NOT NULL DEFAULT 'ITAU',
  client_id TEXT NOT NULL,
  nosso_numero TEXT NOT NULL,
  codigo_barras TEXT NOT NULL,
  linha_digitavel TEXT NOT NULL,
  url_boleto TEXT NOT NULL,
  data_vencimento TIMESTAMP WITH TIME ZONE NOT NULL,
  valor DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL,
  nome_pagador TEXT NOT NULL,
  cpf_cnpj_pagador TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_boletos_banco_client_id ON boletos(banco, client_id);
CREATE INDEX idx_boletos_nosso_numero ON boletos(nosso_numero);
CREATE INDEX idx_boletos_status ON boletos(status);
