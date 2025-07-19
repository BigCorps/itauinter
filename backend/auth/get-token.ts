import { api, APIError } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

const authDB = SQLDatabase.named("auth");

interface GetTokenRequest {
  clientId: string;
  banco?: string;
}

interface GetTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  generatedAt: Date;
  isExpired: boolean;
  remainingTime: number;
  poolId?: string;
  strategy: "single" | "pool";
}

// Recupera o último token válido para um client_id
export const getToken = api<GetTokenRequest, GetTokenResponse>(
  { expose: true, method: "GET", path: "/auth/token/:clientId" },
  async (req) => {
    try {
      const banco = req.banco || "ITAU";

      // Buscar o token mais recente para o client_id e banco
      const tokenRow = await authDB.queryRow<{
        access_token: string;
        token_type: string;
        expires_in: number;
        generated_at: Date;
        pool_id: string;
      }>`
        SELECT access_token, token_type, expires_in, generated_at, 
               COALESCE(pool_id, 'legacy-' || id::text) as pool_id
        FROM tokens 
        WHERE client_id = ${req.clientId} AND banco = ${banco} AND is_active = TRUE
        ORDER BY generated_at DESC
        LIMIT 1
      `;

      if (!tokenRow) {
        throw APIError.notFound("Token não encontrado para este client_id e banco");
      }

      // Verificar se o token expirou
      const now = new Date();
      const tokenAge = (now.getTime() - tokenRow.generated_at.getTime()) / 1000;
      const remainingTime = tokenRow.expires_in - tokenAge;
      const isExpired = remainingTime <= 0;

      // Atualizar estatísticas de uso se o token ainda é válido
      if (!isExpired) {
        await authDB.exec`
          UPDATE tokens 
          SET last_used_at = NOW(), usage_count = usage_count + 1
          WHERE client_id = ${req.clientId} AND banco = ${banco} AND access_token = ${tokenRow.access_token}
        `;
      }

      return {
        accessToken: tokenRow.access_token,
        tokenType: tokenRow.token_type,
        expiresIn: tokenRow.expires_in,
        generatedAt: tokenRow.generated_at,
        isExpired,
        remainingTime: Math.max(0, Math.floor(remainingTime)),
        poolId: tokenRow.pool_id,
        strategy: banco === "ITAU" ? "pool" : "single",
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw APIError.internal(`Erro interno: ${error}`);
    }
  }
);
