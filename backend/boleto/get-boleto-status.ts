import { api, APIError } from "encore.dev/api";

interface GetBoletoStatusRequest {
  clientId: string;
  accessToken: string;
  nossoNumero: string;
}

interface BoletoStatusResponse {
  nossoNumero: string;
  status: string;
  valor: number;
  dataVencimento: Date;
  dataPagamento?: Date;
  valorPago?: number;
  codigoBarras: string;
  linhaDigitavel: string;
}

// Consulta o status de um boleto
export const getBoletoStatus = api<GetBoletoStatusRequest, BoletoStatusResponse>(
  { expose: true, method: "GET", path: "/boleto/status/:nossoNumero" },
  async (req) => {
    try {
      // Validar campos obrigatórios
      if (!req.clientId || !req.accessToken || !req.nossoNumero) {
        throw APIError.invalidArgument("Campos obrigatórios: clientId, accessToken, nossoNumero");
      }

      // Fazer a requisição para a API de Boletos do Itaú
      const boletoResponse = await fetch(`https://api.itau.com.br/boletos/v1/boletos/${req.nossoNumero}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${req.accessToken}`,
          "Content-Type": "application/json",
          "x-itau-client-id": req.clientId,
        },
      });

      if (!boletoResponse.ok) {
        const errorText = await boletoResponse.text();
        throw APIError.internal(`Erro ao consultar status do boleto: ${errorText}`);
      }

      const boletoData = await boletoResponse.json();

      return {
        nossoNumero: boletoData.nosso_numero,
        status: boletoData.status,
        valor: boletoData.valor,
        dataVencimento: new Date(boletoData.data_vencimento),
        dataPagamento: boletoData.data_pagamento ? new Date(boletoData.data_pagamento) : undefined,
        valorPago: boletoData.valor_pago,
        codigoBarras: boletoData.codigo_barras,
        linhaDigitavel: boletoData.linha_digitavel,
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw APIError.internal(`Erro interno: ${error}`);
    }
  }
);
