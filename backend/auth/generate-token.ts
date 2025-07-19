import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { SQLDatabase } from "encore.dev/storage/sqldb";

const authDB = new SQLDatabase("auth", {
  migrations: "./migrations",
});

interface GenerateTokenRequest {
  clientId: string;
  clientSecret: string;
  certificateContent: string;
  privateKeyContent: string;
}

interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  generatedAt: Date;
}

// Gera um access token usando client credentials flow
export const generateToken = api<GenerateTokenRequest, TokenResponse>(
  { expose: true, method: "POST", path: "/auth/token" },
  async (req) => {
    try {
      // Validar se os campos obrigatórios estão presentes
      if (!req.clientId || !req.clientSecret || !req.certificateContent || !req.privateKeyContent) {
        throw APIError.invalidArgument("Todos os campos são obrigatórios");
      }

      // Salvar as credenciais no banco de dados
      await authDB.exec`
        INSERT INTO credentials (client_id, client_secret, certificate_content, private_key_content, created_at)
        VALUES (${req.clientId}, ${req.clientSecret}, ${req.certificateContent}, ${req.privateKeyContent}, NOW())
        ON CONFLICT (client_id) 
        DO UPDATE SET 
          client_secret = ${req.clientSecret},
          certificate_content = ${req.certificateContent},
          private_key_content = ${req.privateKeyContent},
          updated_at = NOW()
      `;

      // Fazer a requisição para o STS do Itaú
      const tokenResponse = await fetch("https://sts.itau.com.br/api/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: req.clientId,
          client_secret: req.clientSecret,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw APIError.internal(`Erro ao gerar token: ${errorText}`);
      }

      const tokenData = await tokenResponse.json();

      // Salvar o token gerado
      await authDB.exec`
        INSERT INTO tokens (client_id, access_token, token_type, expires_in, generated_at)
        VALUES (${req.clientId}, ${tokenData.access_token}, ${tokenData.token_type}, ${tokenData.expires_in}, NOW())
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
