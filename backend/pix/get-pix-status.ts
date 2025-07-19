import { api, APIError } from "encore.dev/api";

interface GetPixStatusRequest {
  clientId: string;
  accessToken: string;
  idTransacao: string;
}

interface PixStatusResponse {
  idTransacao: string;
  status: string;
  valor: number;
  dataHora: Date;
  endToEndId?: string;
  motivoRejeicao?: string;
}

// Consulta o status de uma transação PIX
export const getPixStatus = api<GetPixStatusRequest, PixStatusResponse>(
  { expose: true, method: "GET", path: "/pix/status/:idTransacao" },
  async (req) => {
    try {
      // Validar campos obrigatórios
      if (!req.clientId || !req.accessToken || !req.idTransacao) {
        throw APIError.invalidArgument("Campos obrigatórios: clientId, accessToken, idTransacao");
      }

      // Fazer a requisição para a API PIX do Itaú
      const pixResponse = await fetch(`https://api.itau.com.br/pix/v1/pagamentos/${req.idTransacao}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${req.accessToken}`,
          "Content-Type": "application/json",
          "x-itau-client-id": req.clientId,
        },
      });

      if (!pixResponse.ok) {
        const errorText = await pixResponse.text();
        throw APIError.internal(`Erro ao consultar status PIX: ${errorText}`);
      }

      const pixData = await pixResponse.json();

      return {
        idTransacao: pixData.id_transacao,
        status: pixData.status,
        valor: pixData.valor,
        dataHora: new Date(pixData.data_hora),
        endToEndId: pixData.end_to_end_id,
        motivoRejeicao: pixData.motivo_rejeicao,
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw APIError.internal(`Erro interno: ${error}`);
    }
  }
);
