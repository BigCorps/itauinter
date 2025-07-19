import { api, APIError } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

const pixDB = new SQLDatabase("pix", {
  migrations: "./migrations",
});

interface CreatePixRequest {
  banco: "ITAU" | "INTER";
  clientId: string;
  accessToken: string;
  valor: number;
  chaveDestinatario: string;
  tipoChave: "CPF" | "CNPJ" | "EMAIL" | "TELEFONE" | "CHAVE_ALEATORIA";
  descricao?: string;
  nomeDestinatario?: string;
}

interface PixResponse {
  idTransacao: string;
  status: string;
  valor: number;
  dataHora: Date;
  endToEndId?: string;
}

// Cria um pagamento PIX
export const createPix = api<CreatePixRequest, PixResponse>(
  { expose: true, method: "POST", path: "/pix/pagamento" },
  async (req) => {
    try {
      // Validar campos obrigatórios
      if (!req.banco || !req.clientId || !req.accessToken || !req.valor || !req.chaveDestinatario || !req.tipoChave) {
        throw APIError.invalidArgument("Campos obrigatórios: banco, clientId, accessToken, valor, chaveDestinatario, tipoChave");
      }

      if (req.valor <= 0) {
        throw APIError.invalidArgument("Valor deve ser maior que zero");
      }

      let pixResponse: Response;
      let pixUrl: string;
      let pixPayload: any;

      if (req.banco === "ITAU") {
        // Preparar o payload para a API do Itaú
        pixUrl = "https://api.itau.com.br/pix/v1/pagamentos";
        pixPayload = {
          valor: req.valor,
          chave_destinatario: req.chaveDestinatario,
          tipo_chave: req.tipoChave,
          descricao: req.descricao || "",
          nome_destinatario: req.nomeDestinatario || "",
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
        pixUrl = "https://cdpj.partners.bancointer.com.br/pix/v2/pix";
        pixPayload = {
          valor: req.valor.toString(),
          chave: req.chaveDestinatario,
          tipoChave: req.tipoChave,
          descricao: req.descricao || "",
          nomeDestinatario: req.nomeDestinatario || "",
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
        throw APIError.internal(`Erro ao criar PIX: ${errorText}`);
      }

      const pixData = await pixResponse.json();

      // Adaptar resposta baseado no banco
      let idTransacao: string;
      let status: string;
      let endToEndId: string | undefined;

      if (req.banco === "ITAU") {
        idTransacao = pixData.id_transacao;
        status = pixData.status;
        endToEndId = pixData.end_to_end_id;
      } else {
        idTransacao = pixData.endToEndId || pixData.txid;
        status = pixData.status || "PENDENTE";
        endToEndId = pixData.endToEndId;
      }

      // Salvar a transação no banco
      await pixDB.exec`
        INSERT INTO pix_transactions (
          banco, client_id, id_transacao, status, valor, chave_destinatario, 
          tipo_chave, descricao, nome_destinatario, end_to_end_id, created_at
        )
        VALUES (
          ${req.banco}, ${req.clientId}, ${idTransacao}, ${status}, ${req.valor}, 
          ${req.chaveDestinatario}, ${req.tipoChave}, ${req.descricao || ""}, 
          ${req.nomeDestinatario || ""}, ${endToEndId || ""}, NOW()
        )
      `;

      return {
        idTransacao,
        status,
        valor: req.valor,
        dataHora: new Date(),
        endToEndId,
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw APIError.internal(`Erro interno: ${error}`);
    }
  }
);
