import { api, APIError } from "encore.dev/api";

interface GetBalanceRequest {
  banco: "ITAU" | "INTER";
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
      if (!req.banco || !req.clientId || !req.accessToken || !req.agencia || !req.conta) {
        throw APIError.invalidArgument("Campos obrigatórios: banco, clientId, accessToken, agencia, conta");
      }

      let balanceResponse: Response;
      let balanceUrl: string;

      if (req.banco === "ITAU") {
        // Fazer a requisição para a API de Conta do Itaú
        balanceUrl = `https://api.itau.com.br/conta/v1/saldo?agencia=${req.agencia}&conta=${req.conta}`;
        balanceResponse = await fetch(balanceUrl, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${req.accessToken}`,
            "Content-Type": "application/json",
            "x-itau-client-id": req.clientId,
          },
        });
      } else if (req.banco === "INTER") {
        // Fazer a requisição para a API de Conta do Inter
        balanceUrl = "https://cdpj.partners.bancointer.com.br/banking/v2/saldo";
        balanceResponse = await fetch(balanceUrl, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${req.accessToken}`,
            "Content-Type": "application/json",
          },
        });
      } else {
        throw APIError.invalidArgument("Banco não suportado");
      }

      if (!balanceResponse.ok) {
        const errorText = await balanceResponse.text();
        throw APIError.internal(`Erro ao consultar saldo: ${errorText}`);
      }

      const balanceData = await balanceResponse.json();

      // Adaptar resposta baseado no banco
      let saldoAtual: number;
      let saldoDisponivel: number;
      let moeda: string;

      if (req.banco === "ITAU") {
        saldoAtual = balanceData.saldo_atual;
        saldoDisponivel = balanceData.saldo_disponivel;
        moeda = balanceData.moeda || "BRL";
      } else {
        saldoAtual = balanceData.disponivel;
        saldoDisponivel = balanceData.disponivel;
        moeda = "BRL";
      }

      return {
        saldoAtual,
        saldoDisponivel,
        dataConsulta: new Date(),
        moeda,
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw APIError.internal(`Erro interno: ${error}`);
    }
  }
);
