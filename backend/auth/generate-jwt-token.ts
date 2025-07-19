import { api, APIError } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

const authDB = SQLDatabase.named("auth");

interface GenerateJWTTokenRequest {
  banco: "ITAU" | "INTER";
  clientId: string;
  privateKeyJwt: string;
  certificateContent: string;
  privateKeyContent: string;
}

interface JWTTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  generatedAt: Date;
}

// Gera um access token usando JWT + mTLS flow
export const generateJWTToken = api<GenerateJWTTokenRequest, JWTTokenResponse>(
  { expose: true, method: "POST", path: "/auth/jwt-token" },
  async (req) => {
    try {
      // Validar se os campos obrigatórios estão presentes
      if (!req.banco || !req.clientId || !req.privateKeyJwt || !req.certificateContent || !req.privateKeyContent) {
        throw APIError.invalidArgument("Todos os campos são obrigatórios");
      }

      // Salvar as credenciais no banco de dados
      await authDB.exec`
        INSERT INTO jwt_credentials (banco, client_id, private_key_jwt, certificate_content, private_key_content, created_at)
        VALUES (${req.banco}, ${req.clientId}, ${req.privateKeyJwt}, ${req.certificateContent}, ${req.privateKeyContent}, NOW())
        ON CONFLICT (banco, client_id) 
        DO UPDATE SET 
          private_key_jwt = ${req.privateKeyJwt},
          certificate_content = ${req.certificateContent},
          private_key_content = ${req.privateKeyContent},
          updated_at = NOW()
      `;

      let tokenResponse: Response;
      let tokenUrl: string;

      if (req.banco === "ITAU") {
        // Fazer a requisição para o STS do Itaú usando JWT
        tokenUrl = "https://sts.itau.com.br/as/token.oauth2";
        tokenResponse = await fetch(tokenUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:client_credentials",
            client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
            client_assertion: req.privateKeyJwt,
          }),
        });
      } else if (req.banco === "INTER") {
        // Para o Inter, JWT é usado de forma similar
        tokenUrl = "https://cdpj.partners.bancointer.com.br/oauth/v2/token";
        tokenResponse = await fetch(tokenUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:client_credentials",
            client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
            client_assertion: req.privateKeyJwt,
            scope: "pix-read pix-write boleto-read boleto-write conta-read",
          }),
        });
      } else {
        throw APIError.invalidArgument("Banco não suportado");
      }

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw APIError.internal(`Erro ao gerar token JWT: ${errorText}`);
      }

      const tokenData = await tokenResponse.json();

      // Salvar o token gerado
      await authDB.exec`
        INSERT INTO jwt_tokens (banco, client_id, access_token, token_type, expires_in, generated_at)
        VALUES (${req.banco}, ${req.clientId}, ${tokenData.access_token}, ${tokenData.token_type}, ${tokenData.expires_in}, NOW())
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
