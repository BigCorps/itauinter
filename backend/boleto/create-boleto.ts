import { api, APIError } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

const boletoDB = new SQLDatabase("boleto", {
  migrations: "./migrations",
});

interface CreateBoletoRequest {
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
      if (!req.clientId || !req.accessToken || !req.valor || !req.vencimento || !req.nomePagador || !req.cpfCnpjPagador) {
        throw APIError.invalidArgument("Campos obrigatórios: clientId, accessToken, valor, vencimento, nomePagador, cpfCnpjPagador");
      }

      if (req.valor <= 0) {
        throw APIError.invalidArgument("Valor deve ser maior que zero");
      }

      // Preparar o payload para a API do Itaú
      const boletoPayload = {
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

      // Fazer a requisição para a API de Boletos do Itaú
      const boletoResponse = await fetch("https://api.itau.com.br/boletos/v1/boletos", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${req.accessToken}`,
          "Content-Type": "application/json",
          "x-itau-client-id": req.clientId,
        },
        body: JSON.stringify(boletoPayload),
      });

      if (!boletoResponse.ok) {
        const errorText = await boletoResponse.text();
        throw APIError.internal(`Erro ao criar boleto: ${errorText}`);
      }

      const boletoData = await boletoResponse.json();

      // Salvar o boleto no banco
      await boletoDB.exec`
        INSERT INTO boletos (
          client_id, nosso_numero, codigo_barras, linha_digitavel, url_boleto,
          data_vencimento, valor, status, nome_pagador, cpf_cnpj_pagador, created_at
        )
        VALUES (
          ${req.clientId}, ${boletoData.nosso_numero}, ${boletoData.codigo_barras}, 
          ${boletoData.linha_digitavel}, ${boletoData.url_boleto}, ${req.vencimento.toISOString()}, 
          ${req.valor}, ${boletoData.status}, ${req.nomePagador}, ${req.cpfCnpjPagador}, NOW()
        )
      `;

      return {
        nossoNumero: boletoData.nosso_numero,
        codigoBarras: boletoData.codigo_barras,
        linhaDigitavel: boletoData.linha_digitavel,
        urlBoleto: boletoData.url_boleto,
        dataVencimento: req.vencimento,
        valor: req.valor,
        status: boletoData.status,
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw APIError.internal(`Erro interno: ${error}`);
    }
  }
);
