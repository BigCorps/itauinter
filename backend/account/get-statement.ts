import { api, APIError, Query } from "encore.dev/api";

interface GetStatementRequest {
  banco: "ITAU" | "INTER";
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
      if (!req.banco || !req.clientId || !req.accessToken || !req.agencia || !req.conta || !req.dataInicio || !req.dataFim) {
        throw APIError.invalidArgument("Campos obrigatórios: banco, clientId, accessToken, agencia, conta, dataInicio, dataFim");
      }

      let statementResponse: Response;
      let statementUrl: string;

      if (req.banco === "ITAU") {
        // Fazer a requisição para a API de Conta do Itaú
        statementUrl = `https://api.itau.com.br/conta/v1/extrato?agencia=${req.agencia}&conta=${req.conta}&data_inicio=${req.dataInicio}&data_fim=${req.dataFim}`;
        statementResponse = await fetch(statementUrl, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${req.accessToken}`,
            "Content-Type": "application/json",
            "x-itau-client-id": req.clientId,
          },
        });
      } else if (req.banco === "INTER") {
        // Fazer a requisição para a API de Conta do Inter
        statementUrl = `https://cdpj.partners.bancointer.com.br/banking/v2/extrato?dataInicio=${req.dataInicio}&dataFim=${req.dataFim}`;
        statementResponse = await fetch(statementUrl, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${req.accessToken}`,
            "Content-Type": "application/json",
          },
        });
      } else {
        throw APIError.invalidArgument("Banco não suportado");
      }

      if (!statementResponse.ok) {
        const errorText = await statementResponse.text();
        throw APIError.internal(`Erro ao consultar extrato: ${errorText}`);
      }

      const statementData = await statementResponse.json();

      // Adaptar resposta baseado no banco
      let saldoInicial: number;
      let saldoFinal: number;
      let transacoes: Transaction[];

      if (req.banco === "ITAU") {
        saldoInicial = statementData.saldo_inicial;
        saldoFinal = statementData.saldo_final;
        transacoes = statementData.transacoes.map((t: any) => ({
          id: t.id,
          data: new Date(t.data),
          descricao: t.descricao,
          valor: t.valor,
          tipo: t.tipo,
          saldo: t.saldo,
        }));
      } else {
        saldoInicial = statementData.saldoInicial || 0;
        saldoFinal = statementData.saldoFinal || 0;
        transacoes = (statementData.transacoes || []).map((t: any) => ({
          id: t.id || t.codigoTransacao,
          data: new Date(t.dataLancamento),
          descricao: t.descricao || t.titulo,
          valor: Math.abs(t.valor),
          tipo: t.valor > 0 ? "CREDITO" : "DEBITO",
          saldo: t.saldo || 0,
        }));
      }

      return {
        agencia: req.agencia,
        conta: req.conta,
        dataInicio: new Date(req.dataInicio),
        dataFim: new Date(req.dataFim),
        saldoInicial,
        saldoFinal,
        transacoes,
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw APIError.internal(`Erro interno: ${error}`);
    }
  }
);
