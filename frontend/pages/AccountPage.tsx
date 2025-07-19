import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Wallet, DollarSign, FileText, ExternalLink, Copy } from "lucide-react";
import backend from "~backend/client";

export function AccountPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [accountResult, setAccountResult] = useState<any>(null);

  const [balanceData, setBalanceData] = useState({
    clientId: "",
    accessToken: "",
    agencia: "",
    conta: "",
  });

  const [statementData, setStatementData] = useState({
    clientId: "",
    accessToken: "",
    agencia: "",
    conta: "",
    dataInicio: "",
    dataFim: "",
  });

  const handleGetBalance = async () => {
    if (!balanceData.clientId || !balanceData.accessToken || !balanceData.agencia || !balanceData.conta) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await backend.account.getBalance(balanceData);
      setAccountResult(response);
      toast({
        title: "Sucesso",
        description: "Saldo consultado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao consultar saldo:", error);
      toast({
        title: "Erro",
        description: "Falha ao consultar saldo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetStatement = async () => {
    if (!statementData.clientId || !statementData.accessToken || !statementData.agencia || !statementData.conta || !statementData.dataInicio || !statementData.dataFim) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await backend.account.getStatement({
        ...statementData,
        dataInicio: statementData.dataInicio,
        dataFim: statementData.dataFim,
      });
      setAccountResult(response);
      toast({
        title: "Sucesso",
        description: "Extrato consultado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao consultar extrato:", error);
      toast({
        title: "Erro",
        description: "Falha ao consultar extrato.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência",
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center space-x-2">
          <Wallet className="h-8 w-8 text-orange-600" />
          <span>Conta Bancária</span>
        </h1>
        <p className="text-gray-600">
          Consulte saldo e extrato da sua conta
        </p>
      </div>

      <Tabs defaultValue="balance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="balance">Consultar Saldo</TabsTrigger>
          <TabsTrigger value="statement">Consultar Extrato</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="balance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Consultar Saldo</span>
              </CardTitle>
              <CardDescription>
                Verifique o saldo atual e disponível da conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="balanceClientId">Client ID</Label>
                  <Input
                    id="balanceClientId"
                    value={balanceData.clientId}
                    onChange={(e) => setBalanceData({ ...balanceData, clientId: e.target.value })}
                    placeholder="Seu Client ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="balanceAccessToken">Access Token</Label>
                  <Input
                    id="balanceAccessToken"
                    value={balanceData.accessToken}
                    onChange={(e) => setBalanceData({ ...balanceData, accessToken: e.target.value })}
                    placeholder="Token de acesso"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="balanceAgencia">Agência</Label>
                  <Input
                    id="balanceAgencia"
                    value={balanceData.agencia}
                    onChange={(e) => setBalanceData({ ...balanceData, agencia: e.target.value })}
                    placeholder="0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="balanceConta">Conta</Label>
                  <Input
                    id="balanceConta"
                    value={balanceData.conta}
                    onChange={(e) => setBalanceData({ ...balanceData, conta: e.target.value })}
                    placeholder="00000-0"
                  />
                </div>
              </div>

              <Button onClick={handleGetBalance} disabled={loading} className="w-full">
                {loading ? "Consultando..." : "Consultar Saldo"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statement">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Consultar Extrato</span>
              </CardTitle>
              <CardDescription>
                Obtenha o extrato detalhado da conta em um período
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="statementClientId">Client ID</Label>
                  <Input
                    id="statementClientId"
                    value={statementData.clientId}
                    onChange={(e) => setStatementData({ ...statementData, clientId: e.target.value })}
                    placeholder="Seu Client ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statementAccessToken">Access Token</Label>
                  <Input
                    id="statementAccessToken"
                    value={statementData.accessToken}
                    onChange={(e) => setStatementData({ ...statementData, accessToken: e.target.value })}
                    placeholder="Token de acesso"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="statementAgencia">Agência</Label>
                  <Input
                    id="statementAgencia"
                    value={statementData.agencia}
                    onChange={(e) => setStatementData({ ...statementData, agencia: e.target.value })}
                    placeholder="0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statementConta">Conta</Label>
                  <Input
                    id="statementConta"
                    value={statementData.conta}
                    onChange={(e) => setStatementData({ ...statementData, conta: e.target.value })}
                    placeholder="00000-0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataInicio">Data Início</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={statementData.dataInicio}
                    onChange={(e) => setStatementData({ ...statementData, dataInicio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataFim">Data Fim</Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={statementData.dataFim}
                    onChange={(e) => setStatementData({ ...statementData, dataFim: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleGetStatement} disabled={loading} className="w-full">
                {loading ? "Consultando..." : "Consultar Extrato"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ExternalLink className="h-5 w-5" />
                <span>Documentação da API Conta</span>
              </CardTitle>
              <CardDescription>
                URLs, headers e bodies para integração com APIs de Conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-base md:text-lg font-semibold">1. Consultar Saldo</h3>
                <div className="bg-gray-50 p-3 md:p-4 rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-sm">URL:</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("https://token.bigcorps.com.br/account/saldo")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="block bg-white p-2 rounded border text-xs md:text-sm break-all">
                    https://token.bigcorps.com.br/account/saldo
                  </code>
                  
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-sm">Método:</Label>
                  </div>
                  <code className="block bg-white p-2 rounded border text-xs md:text-sm">GET</code>
                  
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-sm">Headers:</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('{"Content-Type": "application/json"}')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="block bg-white p-2 rounded border text-xs md:text-sm overflow-x-auto">
                    {JSON.stringify({"Content-Type": "application/json"}, null, 2)}
                  </code>
                  
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-sm">Body:</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify({
                        "banco": "{{banco}}",
                        "clientId": "{{clientId}}",
                        "accessToken": "{{accessToken}}",
                        "agencia": "{{agencia}}",
                        "conta": "{{conta}}"
                      }, null, 2))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="block bg-white p-2 rounded border text-xs md:text-sm whitespace-pre overflow-x-auto">
                    {JSON.stringify({
                      "banco": "{{banco}}",
                      "clientId": "{{clientId}}",
                      "accessToken": "{{accessToken}}",
                      "agencia": "{{agencia}}",
                      "conta": "{{conta}}"
                    }, null, 2)}
                  </code>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-base md:text-lg font-semibold">2. Consultar Extrato</h3>
                <div className="bg-gray-50 p-3 md:p-4 rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-sm">URL:</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("https://token.bigcorps.com.br/account/extrato?dataInicio={{dataInicio}}&dataFim={{dataFim}}")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="block bg-white p-2 rounded border text-xs md:text-sm break-all">
                    https://token.bigcorps.com.br/account/extrato?dataInicio={"{{dataInicio}}"}&dataFim={"{{dataFim}}"}
                  </code>
                  
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-sm">Método:</Label>
                  </div>
                  <code className="block bg-white p-2 rounded border text-xs md:text-sm">GET</code>
                  
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-sm">Headers:</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('{"Content-Type": "application/json"}')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="block bg-white p-2 rounded border text-xs md:text-sm overflow-x-auto">
                    {JSON.stringify({"Content-Type": "application/json"}, null, 2)}
                  </code>
                  
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-sm">Body:</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify({
                        "banco": "{{banco}}",
                        "clientId": "{{clientId}}",
                        "accessToken": "{{accessToken}}",
                        "agencia": "{{agencia}}",
                        "conta": "{{conta}}"
                      }, null, 2))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="block bg-white p-2 rounded border text-xs md:text-sm whitespace-pre overflow-x-auto">
                    {JSON.stringify({
                      "banco": "{{banco}}",
                      "clientId": "{{clientId}}",
                      "accessToken": "{{accessToken}}",
                      "agencia": "{{agencia}}",
                      "conta": "{{conta}}"
                    }, null, 2)}
                  </code>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-md p-3 md:p-4">
                <h4 className="font-semibold text-orange-800 mb-2 text-sm md:text-base">Campos Obrigatórios:</h4>
                <ul className="text-xs md:text-sm text-orange-700 space-y-1">
                  <li>• <strong>banco</strong> - ITAU ou INTER</li>
                  <li>• <strong>agencia</strong> - Número da agência (ex: 0001)</li>
                  <li>• <strong>conta</strong> - Número da conta com dígito (ex: 12345-6)</li>
                  <li>• <strong>dataInicio</strong> - Data inicial no formato YYYY-MM-DD (apenas extrato)</li>
                  <li>• <strong>dataFim</strong> - Data final no formato YYYY-MM-DD (apenas extrato)</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 md:p-4">
                <h4 className="font-semibold text-blue-800 mb-2 text-sm md:text-base">Observações:</h4>
                <ul className="text-xs md:text-sm text-blue-700 space-y-1">
                  <li>• Substitua as variáveis {"{{variavel}}"} pelos valores reais</li>
                  <li>• Use o accessToken obtido da API de autenticação</li>
                  <li>• Para extrato, as datas são passadas como query parameters</li>
                  <li>• O período máximo para extrato é de 90 dias</li>
                  <li>• Agência e conta devem estar no formato correto do banco</li>
                  <li>• Verifique se a conta tem permissão para consulta</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {accountResult && (
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-800">Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-white p-4 rounded-md border border-orange-200 overflow-auto">
              {JSON.stringify(accountResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
