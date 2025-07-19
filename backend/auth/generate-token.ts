import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { SQLDatabase } from "encore.dev/storage/sqldb";

const authDB = new SQLDatabase("auth", {
  migrations: "./migrations",
});

interface GenerateTokenRequest {
  banco: "ITAU" | "INTER";
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
  poolId?: string;
  strategy: "single" | "pool";
}

// Gera um access token usando client credentials flow
export const generateToken = api<GenerateTokenRequest, TokenResponse>(
  { expose: true, method: "POST", path: "/auth/token" },
  async (req) => {
    try {
      // Validar se os campos obrigatórios estão presentes
      if (!req.banco || !req.clientId || !req.clientSecret || !req.certificateContent || !req.privateKeyContent) {
        throw APIError.invalidArgument("Todos os campos são obrigatórios");
      }

      // Salvar as credenciais no banco de dados
      await authDB.exec`
        INSERT INTO credentials (banco, client_id, client_secret, certificate_content, private_key_content, created_at)
        VALUES (${req.banco}, ${req.clientId}, ${req.clientSecret}, ${req.certificateContent}, ${req.privateKeyContent}, NOW())
        ON CONFLICT (banco, client_id) 
        DO UPDATE SET 
          client_secret = ${req.clientSecret},
          certificate_content = ${req.certificateContent},
          private_key_content = ${req.privateKeyContent},
          updated_at = NOW()
      `;

      let tokenResponse: Response;
      let tokenUrl: string;
      let requestBody: URLSearchParams;

      if (req.banco === "ITAU") {
        // Fazer a requisição para o STS do Itaú
        tokenUrl = "https://sts.itau.com.br/api/oauth/token";
        requestBody = new URLSearchParams({
          grant_type: "client_credentials",
          client_id: req.clientId,
          client_secret: req.clientSecret,
        });
      } else if (req.banco === "INTER") {
        // Fazer a requisição para o OAuth do Inter
        tokenUrl = "https://cdpj.partners.bancointer.com.br/oauth/v2/token";
        requestBody = new URLSearchParams({
          grant_type: "client_credentials",
          client_id: req.clientId,
          client_secret: req.clientSecret,
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
        throw APIError.internal(`Erro ao gerar token: ${errorText}`);
      }

      const tokenData = await tokenResponse.json();

      // Gerar pool ID para controle
      const poolId = `${req.banco.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Definir expiração baseada no banco
      let expiresIn = tokenData.expires_in;
      if (req.banco === "INTER" && !expiresIn) {
        // Inter: 2 anos = 63072000 segundos
        expiresIn = 63072000;
      }

      // Salvar o token gerado
      await authDB.exec`
        INSERT INTO tokens (banco, client_id, access_token, token_type, expires_in, generated_at, pool_id, is_active)
        VALUES (${req.banco}, ${req.clientId}, ${tokenData.access_token}, ${tokenData.token_type}, ${expiresIn}, NOW(), ${poolId}, TRUE)
      `;

      // Criar ou atualizar pool para Itaú
      if (req.banco === "ITAU") {
        await authDB.exec`
          INSERT INTO token_pools (banco, client_id, pool_size, max_pool_size)
          VALUES (${req.banco}, ${req.clientId}, 3, 5)
          ON CONFLICT (banco, client_id) 
          DO UPDATE SET updated_at = NOW()
        `;
      }

      return {
        accessToken: tokenData.access_token,
        tokenType: tokenData.token_type,
        expiresIn: expiresIn,
        generatedAt: new Date(),
        poolId: poolId,
        strategy: req.banco === "ITAU" ? "pool" : "single",
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw APIError.internal(`Erro interno: ${error}`);
    }
  }
);
