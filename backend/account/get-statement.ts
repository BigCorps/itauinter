import { api, APIError, Query } from "encore.dev/api";

interface GetStatementRequest {
  clientId: string;
  accessToken: string;
  agencia: string;
  conta: string;
  dataInicio: Query<string>;
  dataFim: Query<string>;
}

interface Transaction {
  id: string;
  data: Date;
  descricao: string;
  valor: number;
  tipo: "CREDITO" | "DEBITO";
  saldo: number;
}

interface StatementResponse {
  agencia: string;
  conta: string;
  dataInicio: Date;
  dataFim: Date;
  saldoInicial: number;
  saldoFinal: number;
  transacoes: Transaction[];
}

// Consulta o extrato da conta
export const getStatement = api<GetStatementRequest, StatementResponse>(
  { expose: true, method: "GET", path: "/account/extrato" },
  async (req) => {
    try {
      // Validar campos obrigatórios
      if (!req.clientId || !req.accessToken || !req.agencia || !req.conta || !req.dataInicio || !req.dataFim) {
        throw APIError.invalidArgument("Campos obrigatórios: clientId, accessToken, agencia, conta, dataInicio, dataFim");
      }

      // Fazer a requisição para a API de Conta do Itaú
      const statementResponse = await fetch(
        `https://api.itau.com.br/conta/v1/extrato?agencia=${req.agencia}&conta=${req.conta}&data_inicio=${req.dataInicio}&data_fim=${req.dataFim}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${req.accessToken}`,
            "Content-Type": "application/json",
            "x-itau-client-id": req.clientId,
          },
        }
      );

      if (!statementResponse.ok) {
        const errorText = await statementResponse.text();
        throw APIError.internal(`Erro ao consultar extrato: ${errorText}`);
      }

      const statementData = await statementResponse.json();

      return {
        agencia: req.agencia,
        conta: req.conta,
        dataInicio: new Date(req.dataInicio),
        dataFim: new Date(req.dataFim),
        saldoInicial: statementData.saldo_inicial,
        saldoFinal: statementData.saldo_final,
        transacoes: statementData.transacoes.map((t: any) => ({
          id: t.id,
          data: new Date(t.data),
          descricao: t.descricao,
          valor: t.valor,
          tipo: t.tipo,
          saldo: t.saldo,
        })),
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw APIError.internal(`Erro interno: ${error}`);
    }
  }
);
