import { api, APIError } from "encore.dev/api";

interface GetBoletoStatusRequest {
  banco: "ITAU" | "INTER";
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
      if (!req.banco || !req.clientId || !req.accessToken || !req.nossoNumero) {
        throw APIError.invalidArgument("Campos obrigatórios: banco, clientId, accessToken, nossoNumero");
      }

      let boletoResponse: Response;
      let boletoUrl: string;

      if (req.banco === "ITAU") {
        // Fazer a requisição para a API de Boletos do Itaú
        boletoUrl = `https://api.itau.com.br/boletos/v1/boletos/${req.nossoNumero}`;
        boletoResponse = await fetch(boletoUrl, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${req.accessToken}`,
            "Content-Type": "application/json",
            "x-itau-client-id": req.clientId,
          },
        });
      } else if (req.banco === "INTER") {
        // Fazer a requisição para a API de Boletos do Inter
        boletoUrl = `https://cdpj.partners.bancointer.com.br/cobranca/v3/cobrancas/${req.nossoNumero}`;
        boletoResponse = await fetch(boletoUrl, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${req.accessToken}`,
            "Content-Type": "application/json",
          },
        });
      } else {
        throw APIError.invalidArgument("Banco não suportado");
      }

      if (!boletoResponse.ok) {
        const errorText = await boletoResponse.text();
        throw APIError.internal(`Erro ao consultar status do boleto: ${errorText}`);
      }

      const boletoData = await boletoResponse.json();

      // Adaptar resposta baseado no banco
      let nossoNumero: string;
      let status: string;
      let valor: number;
      let dataVencimento: Date;
      let dataPagamento: Date | undefined;
      let valorPago: number | undefined;
      let codigoBarras: string;
      let linhaDigitavel: string;

      if (req.banco === "ITAU") {
        nossoNumero = boletoData.nosso_numero;
        status = boletoData.status;
        valor = boletoData.valor;
        dataVencimento = new Date(boletoData.data_vencimento);
        dataPagamento = boletoData.data_pagamento ? new Date(boletoData.data_pagamento) : undefined;
        valorPago = boletoData.valor_pago;
        codigoBarras = boletoData.codigo_barras;
        linhaDigitavel = boletoData.linha_digitavel;
      } else {
        nossoNumero = boletoData.nossoNumero;
        status = boletoData.situacao;
        valor = boletoData.valorNominal;
        dataVencimento = new Date(boletoData.dataVencimento);
        dataPagamento = boletoData.dataPagamento ? new Date(boletoData.dataPagamento) : undefined;
        valorPago = boletoData.valorPago;
        codigoBarras = boletoData.codigoBarras;
        linhaDigitavel = boletoData.linhaDigitavel;
      }

      return {
        nossoNumero,
        status,
        valor,
        dataVencimento,
        dataPagamento,
        valorPago,
        codigoBarras,
        linhaDigitavel,
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw APIError.internal(`Erro interno: ${error}`);
    }
  }
);
