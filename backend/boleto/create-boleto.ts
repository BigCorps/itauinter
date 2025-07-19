import { api, APIError } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

const boletoDB = new SQLDatabase("boleto", {
  migrations: "./migrations",
});

interface CreateBoletoRequest {
  banco: "ITAU" | "INTER";
  clientId: string;
  accessToken: string;
  valor: number;
  vencimento: Date;
  nomePagador: string;
  cpfCnpjPagador: string;
  enderecoPagador: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  descricao?: string;
  instrucoes?: string;
  multa?: {
    tipo: "PERCENTUAL" | "VALOR_FIXO";
    valor: number;
    dataInicio: Date;
  };
  juros?: {
    tipo: "PERCENTUAL_MES" | "VALOR_DIA";
    valor: number;
  };
}

interface BoletoResponse {
  nossoNumero: string;
  codigoBarras: string;
  linhaDigitavel: string;
  urlBoleto: string;
  dataVencimento: Date;
  valor: number;
  status: string;
}

// Cria um boleto bancário
export const createBoleto = api<CreateBoletoRequest, BoletoResponse>(
  { expose: true, method: "POST", path: "/boleto/criar" },
  async (req) => {
    try {
      // Validar campos obrigatórios
      if (!req.banco || !req.clientId || !req.accessToken || !req.valor || !req.vencimento || !req.nomePagador || !req.cpfCnpjPagador) {
        throw APIError.invalidArgument("Campos obrigatórios: banco, clientId, accessToken, valor, vencimento, nomePagador, cpfCnpjPagador");
      }

      if (req.valor <= 0) {
        throw APIError.invalidArgument("Valor deve ser maior que zero");
      }

      let boletoResponse: Response;
      let boletoUrl: string;
      let boletoPayload: any;

      if (req.banco === "ITAU") {
        // Preparar o payload para a API do Itaú
        boletoUrl = "https://api.itau.com.br/boletos/v1/boletos";
        boletoPayload = {
          valor: req.valor,
          data_vencimento: req.vencimento.toISOString().split('T')[0],
          pagador: {
            nome: req.nomePagador,
            cpf_cnpj: req.cpfCnpjPagador,
            endereco: req.enderecoPagador,
          },
          descricao: req.descricao || "",
          instrucoes: req.instrucoes || "",
          multa: req.multa,
          juros: req.juros,
        };

        boletoResponse = await fetch(boletoUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${req.accessToken}`,
            "Content-Type": "application/json",
            "x-itau-client-id": req.clientId,
          },
          body: JSON.stringify(boletoPayload),
        });
      } else if (req.banco === "INTER") {
        // Preparar o payload para a API do Inter
        boletoUrl = "https://cdpj.partners.bancointer.com.br/cobranca/v3/cobrancas";
        boletoPayload = {
          seuNumero: Date.now().toString(),
          valorNominal: req.valor,
          dataVencimento: req.vencimento.toISOString().split('T')[0],
          numDiasAgenda: 0,
          pagador: {
            cpfCnpj: req.cpfCnpjPagador,
            nome: req.nomePagador,
            endereco: req.enderecoPagador.logradouro,
            numero: req.enderecoPagador.numero,
            complemento: req.enderecoPagador.complemento || "",
            bairro: req.enderecoPagador.bairro,
            cidade: req.enderecoPagador.cidade,
            uf: req.enderecoPagador.uf,
            cep: req.enderecoPagador.cep.replace(/\D/g, ''),
          },
          mensagem: {
            linha1: req.descricao || "",
            linha2: req.instrucoes || "",
          },
          multa: req.multa ? {
            codigoMulta: req.multa.tipo === "PERCENTUAL" ? "PERCENTUAL" : "VALOR_FIXO",
            valor: req.multa.valor,
            data: req.multa.dataInicio.toISOString().split('T')[0],
          } : undefined,
          mora: req.juros ? {
            codigoMora: req.juros.tipo === "PERCENTUAL_MES" ? "PERCENTUAL_MES" : "VALOR_DIA",
            valor: req.juros.valor,
          } : undefined,
        };

        boletoResponse = await fetch(boletoUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${req.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(boletoPayload),
        });
      } else {
        throw APIError.invalidArgument("Banco não suportado");
      }

      if (!boletoResponse.ok) {
        const errorText = await boletoResponse.text();
        throw APIError.internal(`Erro ao criar boleto: ${errorText}`);
      }

      const boletoData = await boletoResponse.json();

      // Adaptar resposta baseado no banco
      let nossoNumero: string;
      let codigoBarras: string;
      let linhaDigitavel: string;
      let urlBoleto: string;
      let status: string;

      if (req.banco === "ITAU") {
        nossoNumero = boletoData.nosso_numero;
        codigoBarras = boletoData.codigo_barras;
        linhaDigitavel = boletoData.linha_digitavel;
        urlBoleto = boletoData.url_boleto;
        status = boletoData.status;
      } else {
        nossoNumero = boletoData.nossoNumero;
        codigoBarras = boletoData.codigoBarras;
        linhaDigitavel = boletoData.linhaDigitavel;
        urlBoleto = boletoData.pdfBoleto;
        status = "EMITIDO";
      }

      // Salvar o boleto no banco
      await boletoDB.exec`
        INSERT INTO boletos (
          banco, client_id, nosso_numero, codigo_barras, linha_digitavel, url_boleto,
          data_vencimento, valor, status, nome_pagador, cpf_cnpj_pagador, created_at
        )
        VALUES (
          ${req.banco}, ${req.clientId}, ${nossoNumero}, ${codigoBarras}, 
          ${linhaDigitavel}, ${urlBoleto}, ${req.vencimento.toISOString()}, 
          ${req.valor}, ${status}, ${req.nomePagador}, ${req.cpfCnpjPagador}, NOW()
        )
      `;

      return {
        nossoNumero,
        codigoBarras,
        linhaDigitavel,
        urlBoleto,
        dataVencimento: req.vencimento,
        valor: req.valor,
        status,
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw APIError.internal(`Erro interno: ${error}`);
    }
  }
);
