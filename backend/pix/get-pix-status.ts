import { api, APIError } from "encore.dev/api";

interface GetPixStatusRequest {
  banco: "ITAU" | "INTER";
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
      if (!req.banco || !req.clientId || !req.accessToken || !req.idTransacao) {
        throw APIError.invalidArgument("Campos obrigatórios: banco, clientId, accessToken, idTransacao");
      }

      let pixResponse: Response;
      let pixUrl: string;

      if (req.banco === "ITAU") {
        // Fazer a requisição para a API PIX do Itaú
        pixUrl = `https://api.itau.com.br/pix/v1/pagamentos/${req.idTransacao}`;
        pixResponse = await fetch(pixUrl, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${req.accessToken}`,
            "Content-Type": "application/json",
            "x-itau-client-id": req.clientId,
          },
        });
      } else if (req.banco === "INTER") {
        // Fazer a requisição para a API PIX do Inter
        pixUrl = `https://cdpj.partners.bancointer.com.br/pix/v2/pix/${req.idTransacao}`;
        pixResponse = await fetch(pixUrl, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${req.accessToken}`,
            "Content-Type": "application/json",
          },
        });
      } else {
        throw APIError.invalidArgument("Banco não suportado");
      }

      if (!pixResponse.ok) {
        const errorText = await pixResponse.text();
        throw APIError.internal(`Erro ao consultar status PIX: ${errorText}`);
      }

      const pixData = await pixResponse.json();

      // Adaptar resposta baseado no banco
      let idTransacao: string;
      let status: string;
      let valor: number;
      let dataHora: Date;
      let endToEndId: string | undefined;
      let motivoRejeicao: string | undefined;

      if (req.banco === "ITAU") {
        idTransacao = pixData.id_transacao;
        status = pixData.status;
        valor = pixData.valor;
        dataHora = new Date(pixData.data_hora);
        endToEndId = pixData.end_to_end_id;
        motivoRejeicao = pixData.motivo_rejeicao;
      } else {
        idTransacao = pixData.endToEndId || req.idTransacao;
        status = pixData.status || "PENDENTE";
        valor = parseFloat(pixData.valor || "0");
        dataHora = new Date(pixData.horario || Date.now());
        endToEndId = pixData.endToEndId;
        motivoRejeicao = pixData.devolucoes?.[0]?.motivo;
      }

      return {
        idTransacao,
        status,
        valor,
        dataHora,
        endToEndId,
        motivoRejeicao,
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw APIError.internal(`Erro interno: ${error}`);
    }
  }
);
