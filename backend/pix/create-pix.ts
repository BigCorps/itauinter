import { api, APIError } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

const pixDB = new SQLDatabase("pix", {
  migrations: "./migrations",
});

interface CreatePixRequest {
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
      if (!req.clientId || !req.accessToken || !req.valor || !req.chaveDestinatario || !req.tipoChave) {
        throw APIError.invalidArgument("Campos obrigatórios: clientId, accessToken, valor, chaveDestinatario, tipoChave");
      }

      if (req.valor <= 0) {
        throw APIError.invalidArgument("Valor deve ser maior que zero");
      }

      // Preparar o payload para a API do Itaú
      const pixPayload = {
        valor: req.valor,
        chave_destinatario: req.chaveDestinatario,
        tipo_chave: req.tipoChave,
        descricao: req.descricao || "",
        nome_destinatario: req.nomeDestinatario || "",
      };

      // Fazer a requisição para a API PIX do Itaú
      const pixResponse = await fetch("https://api.itau.com.br/pix/v1/pagamentos", {
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
        throw APIError.internal(`Erro ao criar PIX: ${errorText}`);
      }

      const pixData = await pixResponse.json();

      // Salvar a transação no banco
      await pixDB.exec`
        INSERT INTO pix_transactions (
          client_id, id_transacao, status, valor, chave_destinatario, 
          tipo_chave, descricao, nome_destinatario, end_to_end_id, created_at
        )
        VALUES (
          ${req.clientId}, ${pixData.id_transacao}, ${pixData.status}, ${req.valor}, 
          ${req.chaveDestinatario}, ${req.tipoChave}, ${req.descricao || ""}, 
          ${req.nomeDestinatario || ""}, ${pixData.end_to_end_id || ""}, NOW()
        )
      `;

      return {
        idTransacao: pixData.id_transacao,
        status: pixData.status,
        valor: req.valor,
        dataHora: new Date(),
        endToEndId: pixData.end_to_end_id,
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw APIError.internal(`Erro interno: ${error}`);
    }
  }
);
