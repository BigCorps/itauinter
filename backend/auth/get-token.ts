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
      }>`
        SELECT access_token, token_type, expires_in, generated_at
        FROM tokens 
        WHERE client_id = ${req.clientId} AND banco = ${banco}
        ORDER BY generated_at DESC
        LIMIT 1
      `;

      if (!tokenRow) {
        throw APIError.notFound("Token não encontrado para este client_id e banco");
      }

      // Verificar se o token expirou (5 minutos = 300 segundos)
      const now = new Date();
      const tokenAge = (now.getTime() - tokenRow.generated_at.getTime()) / 1000;
      const isExpired = tokenAge >= tokenRow.expires_in;

      return {
        accessToken: tokenRow.access_token,
        tokenType: tokenRow.token_type,
        expiresIn: tokenRow.expires_in,
        generatedAt: tokenRow.generated_at,
        isExpired,
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw APIError.internal(`Erro interno: ${error}`);
    }
  }
);
