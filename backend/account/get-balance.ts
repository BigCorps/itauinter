import { api, APIError } from "encore.dev/api";

interface GetBalanceRequest {
  clientId: string;
  accessToken: string;
  agencia: string;
  conta: string;
}

interface BalanceResponse {
  saldoAtual: number;
  saldoDisponivel: number;
  dataConsulta: Date;
  moeda: string;
}

// Consulta o saldo da conta
export const getBalance = api<GetBalanceRequest, BalanceResponse>(
  { expose: true, method: "GET", path: "/account/saldo" },
  async (req) => {
    try {
      // Validar campos obrigatórios
      if (!req.clientId || !req.accessToken || !req.agencia || !req.conta) {
        throw APIError.invalidArgument("Campos obrigatórios: clientId, accessToken, agencia, conta");
      }

      // Fazer a requisição para a API de Conta do Itaú
      const balanceResponse = await fetch(`https://api.itau.com.br/conta/v1/saldo?agencia=${req.agencia}&conta=${req.conta}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${req.accessToken}`,
          "Content-Type": "application/json",
          "x-itau-client-id": req.clientId,
        },
      });

      if (!balanceResponse.ok) {
        const errorText = await balanceResponse.text();
        throw APIError.internal(`Erro ao consultar saldo: ${errorText}`);
      }

      const balanceData = await balanceResponse.json();

      return {
        saldoAtual: balanceData.saldo_atual,
        saldoDisponivel: balanceData.saldo_disponivel,
        dataConsulta: new Date(),
        moeda: balanceData.moeda || "BRL",
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw APIError.internal(`Erro interno: ${error}`);
    }
  }
);
