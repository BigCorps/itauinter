import { api, APIError, Query } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

const authDB = SQLDatabase.named("auth");

interface GetPoolTokenRequest {
  clientId: string;
  banco?: Query<string>;
}

interface PoolTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  generatedAt: Date;
  poolId: string;
  remainingTime: number;
}

// Obtém um token válido do pool, criando novos se necessário
export const getPoolToken = api<GetPoolTokenRequest, PoolTokenResponse>(
  { expose: true, method: "GET", path: "/auth/pool/:clientId" },
  async (req) => {
    try {
      const banco = req.banco || "ITAU";

      // Para Inter, usar token único de longa duração
      if (banco === "INTER") {
        return await getInterToken(req.clientId);
      }

      // Para Itaú, usar pool de tokens
      return await getItauPoolToken(req.clientId);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw APIError.internal(`Erro interno: ${error}`);
    }
  }
);

async function getInterToken(clientId: string): Promise<PoolTokenResponse> {
  // Buscar token Inter válido (2 anos de duração)
  const tokenRow = await authDB.queryRow<{
    access_token: string;
    token_type: string;
    expires_in: number;
    generated_at: Date;
    pool_id: string;
  }>`
    SELECT access_token, token_type, expires_in, generated_at, 
           COALESCE(pool_id, 'inter-' || id::text) as pool_id
    FROM tokens 
    WHERE client_id = ${clientId} AND banco = 'INTER' AND is_active = TRUE
    ORDER BY generated_at DESC
    LIMIT 1
  `;

  if (!tokenRow) {
    throw APIError.notFound("Token Inter não encontrado. Gere um token primeiro.");
  }

  // Verificar se o token ainda é válido (2 anos = 63072000 segundos)
  const now = new Date();
  const tokenAge = (now.getTime() - tokenRow.generated_at.getTime()) / 1000;
  const remainingTime = tokenRow.expires_in - tokenAge;

  if (remainingTime <= 0) {
    throw APIError.notFound("Token Inter expirado. Gere um novo token.");
  }

  // Atualizar estatísticas de uso
  await authDB.exec`
    UPDATE tokens 
    SET last_used_at = NOW(), usage_count = usage_count + 1
    WHERE client_id = ${clientId} AND banco = 'INTER' AND access_token = ${tokenRow.access_token}
  `;

  return {
    accessToken: tokenRow.access_token,
    tokenType: tokenRow.token_type,
    expiresIn: tokenRow.expires_in,
    generatedAt: tokenRow.generated_at,
    poolId: tokenRow.pool_id,
    remainingTime: Math.floor(remainingTime),
  };
}

async function getItauPoolToken(clientId: string): Promise<PoolTokenResponse> {
  // Buscar tokens Itaú válidos no pool (5 minutos = 300 segundos)
  const validTokens = await authDB.queryAll<{
    access_token: string;
    token_type: string;
    expires_in: number;
    generated_at: Date;
    pool_id: string;
    usage_count: number;
    last_used_at: Date;
  }>`
    SELECT access_token, token_type, expires_in, generated_at, 
           COALESCE(pool_id, 'itau-' || id::text) as pool_id,
           usage_count, last_used_at
    FROM tokens 
    WHERE client_id = ${clientId} AND banco = 'ITAU' AND is_active = TRUE
    AND (EXTRACT(EPOCH FROM (NOW() - generated_at)) < expires_in - 30)
    ORDER BY usage_count ASC, last_used_at ASC
  `;

  let selectedToken = null;

  if (validTokens.length > 0) {
    // Selecionar o token menos usado e mais antigo
    selectedToken = validTokens[0];
  } else {
    // Não há tokens válidos, verificar se podemos gerar um novo
    const poolInfo = await getOrCreatePool(clientId, "ITAU");
    
    if (poolInfo.currentSize < poolInfo.maxPoolSize) {
      // Gerar novo token
      selectedToken = await generateNewItauToken(clientId);
    } else {
      throw APIError.resourceExhausted("Pool de tokens Itaú esgotado. Tente novamente em alguns segundos.");
    }
  }

  if (!selectedToken) {
    throw APIError.internal("Falha ao obter token do pool");
  }

  // Calcular tempo restante
  const now = new Date();
  const tokenAge = (now.getTime() - selectedToken.generated_at.getTime()) / 1000;
  const remainingTime = selectedToken.expires_in - tokenAge;

  // Atualizar estatísticas de uso
  await authDB.exec`
    UPDATE tokens 
    SET last_used_at = NOW(), usage_count = usage_count + 1
    WHERE client_id = ${clientId} AND banco = 'ITAU' AND access_token = ${selectedToken.access_token}
  `;

  // Iniciar geração proativa de novo token se necessário
  if (remainingTime < 120 && validTokens.length < 3) {
    // Não aguardar a geração (fire and forget)
    generateNewItauToken(clientId).catch(console.error);
  }

  return {
    accessToken: selectedToken.access_token,
    tokenType: selectedToken.token_type,
    expiresIn: selectedToken.expires_in,
    generatedAt: selectedToken.generated_at,
    poolId: selectedToken.pool_id,
    remainingTime: Math.floor(remainingTime),
  };
}

async function getOrCreatePool(clientId: string, banco: string) {
  // Verificar se o pool existe
  let poolRow = await authDB.queryRow<{
    pool_size: number;
    max_pool_size: number;
  }>`
    SELECT pool_size, max_pool_size
    FROM token_pools 
    WHERE client_id = ${clientId} AND banco = ${banco}
  `;

  if (!poolRow) {
    // Criar pool
    await authDB.exec`
      INSERT INTO token_pools (banco, client_id, pool_size, max_pool_size)
      VALUES (${banco}, ${clientId}, 3, 5)
      ON CONFLICT (banco, client_id) DO NOTHING
    `;
    poolRow = { pool_size: 3, max_pool_size: 5 };
  }

  // Contar tokens ativos no pool
  const currentSizeRow = await authDB.queryRow<{ count: number }>`
    SELECT COUNT(*) as count
    FROM tokens 
    WHERE client_id = ${clientId} AND banco = ${banco} AND is_active = TRUE
    AND (EXTRACT(EPOCH FROM (NOW() - generated_at)) < expires_in - 30)
  `;

  return {
    poolSize: poolRow.pool_size,
    maxPoolSize: poolRow.max_pool_size,
    currentSize: currentSizeRow?.count || 0,
  };
}

async function generateNewItauToken(clientId: string) {
  // Buscar credenciais
  const credentialsRow = await authDB.queryRow<{
    client_secret: string;
    certificate_content: string;
    private_key_content: string;
  }>`
    SELECT client_secret, certificate_content, private_key_content
    FROM credentials 
    WHERE client_id = ${clientId} AND banco = 'ITAU'
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (!credentialsRow) {
    throw APIError.notFound("Credenciais Itaú não encontradas");
  }

  // Gerar token
  const tokenUrl = "https://sts.itau.com.br/api/oauth/token";
  const requestBody = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: credentialsRow.client_secret,
  });

  const tokenResponse = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: requestBody,
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    throw APIError.internal(`Erro ao gerar token Itaú: ${errorText}`);
  }

  const tokenData = await tokenResponse.json();
  const poolId = `itau-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Salvar token no pool
  await authDB.exec`
    INSERT INTO tokens (banco, client_id, access_token, token_type, expires_in, generated_at, pool_id, is_active)
    VALUES ('ITAU', ${clientId}, ${tokenData.access_token}, ${tokenData.token_type}, ${tokenData.expires_in}, NOW(), ${poolId}, TRUE)
  `;

  return {
    access_token: tokenData.access_token,
    token_type: tokenData.token_type,
    expires_in: tokenData.expires_in,
    generated_at: new Date(),
    pool_id: poolId,
    usage_count: 0,
    last_used_at: new Date(),
  };
}
