import { api, APIError } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

const authDB = SQLDatabase.named("auth");

interface RefreshTokenRequest {
  clientId: string;
  banco?: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  generatedAt: Date;
}

// Renova automaticamente o token usando as credenciais salvas
export const refreshToken = api<RefreshTokenRequest, RefreshTokenResponse>(
  { expose: true, method: "POST", path: "/auth/refresh/:clientId" },
  async (req) => {
    try {
      const banco = req.banco || "ITAU";

      // Buscar as credenciais salvas
      const credentialsRow = await authDB.queryRow<{
        client_secret: string;
        certificate_content: string;
        private_key_content: string;
      }>`
        SELECT client_secret, certificate_content, private_key_content
        FROM credentials 
        WHERE client_id = ${req.clientId} AND banco = ${banco}
        ORDER BY created_at DESC
        LIMIT 1
      `;

      if (!credentialsRow) {
        throw APIError.notFound("Credenciais não encontradas para este client_id e banco");
      }

      let tokenResponse: Response;
      let tokenUrl: string;
      let requestBody: URLSearchParams;

      if (banco === "ITAU") {
        // Fazer a requisição para o STS do Itaú
        tokenUrl = "https://sts.itau.com.br/api/oauth/token";
        requestBody = new URLSearchParams({
          grant_type: "client_credentials",
          client_id: req.clientId,
          client_secret: credentialsRow.client_secret,
        });
      } else if (banco === "INTER") {
        // Fazer a requisição para o OAuth do Inter
        tokenUrl = "https://cdpj.partners.bancointer.com.br/oauth/v2/token";
        requestBody = new URLSearchParams({
          grant_type: "client_credentials",
          client_id: req.clientId,
          client_secret: credentialsRow.client_secret,
          scope: "pix-read pix-write boleto-read boleto-write conta-read",
        });
      } else {
        throw APIError.invalidArgument("Banco não suportado");
      }

      tokenResponse = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: requestBody,
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw APIError.internal(`Erro ao renovar token: ${errorText}`);
      }

      const tokenData = await tokenResponse.json();

      // Salvar o novo token
      await authDB.exec`
        INSERT INTO tokens (banco, client_id, access_token, token_type, expires_in, generated_at)
        VALUES (${banco}, ${req.clientId}, ${tokenData.access_token}, ${tokenData.token_type}, ${tokenData.expires_in}, NOW())
      `;

      return {
        accessToken: tokenData.access_token,
        tokenType: tokenData.token_type,
        expiresIn: tokenData.expires_in,
        generatedAt: new Date(),
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw APIError.internal(`Erro interno: ${error}`);
    }
  }
);
