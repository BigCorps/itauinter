import { api, APIError } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

const pixDB = SQLDatabase.named("pix");

interface CreatePixReceiveRequest {
  clientId: string;
  accessToken: string;
  valor?: number;
  descricao?: string;
  vencimento?: Date;
  chaveRecebimento: string;
  tipoChave: "CPF" | "CNPJ" | "EMAIL" | "TELEFONE" | "CHAVE_ALEATORIA";
}

interface PixReceiveResponse {
  qrCode: string;
  qrCodeBase64: string;
  txId: string;
  valor?: number;
  status: string;
  dataHora: Date;
}

// Cria um QR Code PIX para recebimento
export const createPixReceive = api<CreatePixReceiveRequest, PixReceiveResponse>(
  { expose: true, method: "POST", path: "/pix/recebimento" },
  async (req) => {
    try {
      // Validar campos obrigatórios
      if (!req.clientId || !req.accessToken || !req.chaveRecebimento || !req.tipoChave) {
        throw APIError.invalidArgument("Campos obrigatórios: clientId, accessToken, chaveRecebimento, tipoChave");
      }

      // Preparar o payload para a API do Itaú
      const pixPayload = {
        chave_recebimento: req.chaveRecebimento,
        tipo_chave: req.tipoChave,
        valor: req.valor,
        descricao: req.descricao || "",
        vencimento: req.vencimento?.toISOString(),
      };

      // Fazer a requisição para a API PIX do Itaú
      const pixResponse = await fetch("https://api.itau.com.br/pix/v1/recebimentos", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${req.accessToken}`,
          "Content-Type": "application/json",
          "x-itau-client-id": req.clientId,
        },
        body: JSON.stringify(pixPayload),
      });

      if (!pixResponse.ok) {
        const errorText = await pixResponse.text();
        throw APIError.internal(`Erro ao criar PIX recebimento: ${errorText}`);
      }

      const pixData = await pixResponse.json();

      // Salvar o recebimento no banco
      await pixDB.exec`
        INSERT INTO pix_receives (
          client_id, tx_id, qr_code, qr_code_base64, valor, 
          chave_recebimento, tipo_chave, descricao, vencimento, status, created_at
        )
        VALUES (
          ${req.clientId}, ${pixData.tx_id}, ${pixData.qr_code}, ${pixData.qr_code_base64}, 
          ${req.valor || 0}, ${req.chaveRecebimento}, ${req.tipoChave}, 
          ${req.descricao || ""}, ${req.vencimento?.toISOString() || null}, ${pixData.status}, NOW()
        )
      `;

      return {
        qrCode: pixData.qr_code,
        qrCodeBase64: pixData.qr_code_base64,
        txId: pixData.tx_id,
        valor: req.valor,
        status: pixData.status,
        dataHora: new Date(),
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw APIError.internal(`Erro interno: ${error}`);
    }
  }
);
