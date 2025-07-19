import { api, APIError } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

const pixDB = SQLDatabase.named("pix");

interface CreatePixReceiveRequest {
  banco: "ITAU" | "INTER";
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
      if (!req.banco || !req.clientId || !req.accessToken || !req.chaveRecebimento || !req.tipoChave) {
        throw APIError.invalidArgument("Campos obrigatórios: banco, clientId, accessToken, chaveRecebimento, tipoChave");
      }

      let pixResponse: Response;
      let pixUrl: string;
      let pixPayload: any;

      if (req.banco === "ITAU") {
        // Preparar o payload para a API do Itaú
        pixUrl = "https://api.itau.com.br/pix/v1/recebimentos";
        pixPayload = {
          chave_recebimento: req.chaveRecebimento,
          tipo_chave: req.tipoChave,
          valor: req.valor,
          descricao: req.descricao || "",
          vencimento: req.vencimento?.toISOString(),
        };

        pixResponse = await fetch(pixUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${req.accessToken}`,
            "Content-Type": "application/json",
            "x-itau-client-id": req.clientId,
          },
          body: JSON.stringify(pixPayload),
        });
      } else if (req.banco === "INTER") {
        // Preparar o payload para a API do Inter
        pixUrl = "https://cdpj.partners.bancointer.com.br/pix/v2/cob";
        pixPayload = {
          calendario: {
            expiracao: req.vencimento ? Math.floor((req.vencimento.getTime() - Date.now()) / 1000) : 3600,
          },
          devedor: {
            nome: "Pagador",
          },
          valor: req.valor ? {
            original: req.valor.toFixed(2),
          } : undefined,
          chave: req.chaveRecebimento,
          solicitacaoPagador: req.descricao || "",
        };

        pixResponse = await fetch(pixUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${req.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pixPayload),
        });
      } else {
        throw APIError.invalidArgument("Banco não suportado");
      }

      if (!pixResponse.ok) {
        const errorText = await pixResponse.text();
        throw APIError.internal(`Erro ao criar PIX recebimento: ${errorText}`);
      }

      const pixData = await pixResponse.json();

      // Adaptar resposta baseado no banco
      let qrCode: string;
      let qrCodeBase64: string;
      let txId: string;
      let status: string;

      if (req.banco === "ITAU") {
        qrCode = pixData.qr_code;
        qrCodeBase64 = pixData.qr_code_base64;
        txId = pixData.tx_id;
        status = pixData.status;
      } else {
        qrCode = pixData.pixCopiaECola;
        qrCodeBase64 = Buffer.from(pixData.pixCopiaECola).toString('base64');
        txId = pixData.txid;
        status = pixData.status || "ATIVA";
      }

      // Salvar o recebimento no banco
      await pixDB.exec`
        INSERT INTO pix_receives (
          banco, client_id, tx_id, qr_code, qr_code_base64, valor, 
          chave_recebimento, tipo_chave, descricao, vencimento, status, created_at
        )
        VALUES (
          ${req.banco}, ${req.clientId}, ${txId}, ${qrCode}, ${qrCodeBase64}, 
          ${req.valor || 0}, ${req.chaveRecebimento}, ${req.tipoChave}, 
          ${req.descricao || ""}, ${req.vencimento?.toISOString() || null}, ${status}, NOW()
        )
      `;

      return {
        qrCode,
        qrCodeBase64,
        txId,
        valor: req.valor,
        status,
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
