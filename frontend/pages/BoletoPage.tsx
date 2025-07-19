import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Banknote, Search, ExternalLink, Copy } from "lucide-react";
import backend from "~backend/client";

export function BoletoPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [boletoResult, setBoletoResult] = useState<any>(null);

  const [boletoData, setBoletoData] = useState({
    clientId: "",
    accessToken: "",
    valor: "",
    vencimento: "",
    nomePagador: "",
    cpfCnpjPagador: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    cep: "",
    descricao: "",
    instrucoes: "",
  });

  const [statusData, setStatusData] = useState({
    clientId: "",
    accessToken: "",
    nossoNumero: "",
  });

  const handleCreateBoleto = async () => {
    if (!boletoData.clientId || !boletoData.accessToken || !boletoData.valor || !boletoData.vencimento || !boletoData.nomePagador || !boletoData.cpfCnpjPagador) {
      toast({
        title: "Erro",
        description: "Campos obrigatórios: Client ID, Access Token, Valor, Vencimento, Nome e CPF/CNPJ do Pagador",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await backend.boleto.createBoleto({
        ...boletoData,
        valor: parseFloat(boletoData.valor),
        vencimento: new Date(boletoData.vencimento),
        enderecoPagador: {
          logradouro: boletoData.logradouro,
          numero: boletoData.numero,
          complemento: boletoData.complemento,
          bairro: boletoData.bairro,
          cidade: boletoData.cidade,
          uf: boletoData.uf,
          cep: boletoData.cep,
        },
      });
      setBoletoResult(response);
      toast({
        title: "Sucesso",
        description: "Boleto criado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao criar boleto:", error);
      toast({
        title: "Erro",
        description: "Falha ao criar boleto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!statusData.clientId || !statusData.accessToken || !statusData.nossoNumero) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await backend.boleto.getBoletoStatus(statusData);
      setBoletoResult(response);
      toast({
        title: "Sucesso",
        description: "Status consultado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao consultar status:", error);
      toast({
        title: "Erro",
        description: "Falha ao consultar status do boleto.",
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
          <Banknote className="h-8 w-8 text-purple-600" />
          <span>Boletos</span>
        </h1>
        <p className="text-gray-600">
          Emita e gerencie boletos bancários
        </p>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Criar Boleto</TabsTrigger>
          <TabsTrigger value="status">Consultar Status</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Criar Boleto</CardTitle>
              <CardDescription>
                Emita um novo boleto bancário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client ID</Label>
                  <Input
                    id="clientId"
                    value={boletoData.clientId}
                    onChange={(e) => setBoletoData({ ...boletoData, clientId: e.target.value })}
                    placeholder="Seu Client ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accessToken">Access Token</Label>
                  <Input
                    id="accessToken"
                    value={boletoData.accessToken}
                    onChange={(e) => setBoletoData({ ...boletoData, accessToken: e.target.value })}
                    placeholder="Token de acesso"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={boletoData.valor}
                    onChange={(e) => setBoletoData({ ...boletoData, valor: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vencimento">Data de Vencimento</Label>
                  <Input
                    id="vencimento"
                    type="date"
                    value={boletoData.vencimento}
                    onChange={(e) => setBoletoData({ ...boletoData, vencimento: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dados do Pagador</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nomePagador">Nome Completo</Label>
                    <Input
                      id="nomePagador"
                      value={boletoData.nomePagador}
                      onChange={(e) => setBoletoData({ ...boletoData, nomePagador: e.target.value })}
                      placeholder="Nome do pagador"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpfCnpjPagador">CPF/CNPJ</Label>
                    <Input
                      id="cpfCnpjPagador"
                      value={boletoData.cpfCnpjPagador}
                      onChange={(e) => setBoletoData({ ...boletoData, cpfCnpjPagador: e.target.value })}
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Endereço do Pagador</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="logradouro">Logradouro</Label>
                    <Input
                      id="logradouro"
                      value={boletoData.logradouro}
                      onChange={(e) => setBoletoData({ ...boletoData, logradouro: e.target.value })}
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número</Label>
                    <Input
                      id="numero"
                      value={boletoData.numero}
                      onChange={(e) => setBoletoData({ ...boletoData, numero: e.target.value })}
                      placeholder="123"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      value={boletoData.complemento}
                      onChange={(e) => setBoletoData({ ...boletoData, complemento: e.target.value })}
                      placeholder="Apto, Sala, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      value={boletoData.bairro}
                      onChange={(e) => setBoletoData({ ...boletoData, bairro: e.target.value })}
                      placeholder="Nome do bairro"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      value={boletoData.cep}
                      onChange={(e) => setBoletoData({ ...boletoData, cep: e.target.value })}
                      placeholder="00000-000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={boletoData.cidade}
                      onChange={(e) => setBoletoData({ ...boletoData, cidade: e.target.value })}
                      placeholder="Nome da cidade"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="uf">UF</Label>
                    <Input
                      id="uf"
                      value={boletoData.uf}
                      onChange={(e) => setBoletoData({ ...boletoData, uf: e.target.value })}
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={boletoData.descricao}
                    onChange={(e) => setBoletoData({ ...boletoData, descricao: e.target.value })}
                    placeholder="Descrição do boleto"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instrucoes">Instruções</Label>
                  <Textarea
                    id="instrucoes"
                    value={boletoData.instrucoes}
                    onChange={(e) => setBoletoData({ ...boletoData, instrucoes: e.target.value })}
                    placeholder="Instruções para pagamento"
                    rows={3}
                  />
                </div>
              </div>

              <Button onClick={handleCreateBoleto} disabled={loading} className="w-full">
                {loading ? "Criando..." : "Criar Boleto"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Consultar Status</span>
              </CardTitle>
              <CardDescription>
                Verifique o status de um boleto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="statusClientId">Client ID</Label>
                  <Input
                    id="statusClientId"
                    value={statusData.clientId}
                    onChange={(e) => setStatusData({ ...statusData, clientId: e.target.value })}
                    placeholder="Seu Client ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statusAccessToken">Access Token</Label>
                  <Input
                    id="statusAccessToken"
                    value={statusData.accessToken}
                    onChange={(e) => setStatusData({ ...statusData, accessToken: e.target.value })}
                    placeholder="Token de acesso"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nossoNumero">Nosso Número</Label>
                  <Input
                    id="nossoNumero"
                    value={statusData.nossoNumero}
                    onChange={(e) => setStatusData({ ...statusData, nossoNumero: e.target.value })}
                    placeholder="Número do boleto"
                  />
                </div>
              </div>

              <Button onClick={handleCheckStatus} disabled={loading} className="w-full">
                {loading ? "Consultando..." : "Consultar Status"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ExternalLink className="h-5 w-5" />
                <span>Documentação da API Boleto</span>
              </CardTitle>
              <CardDescription>
                URLs, headers e bodies para integração com APIs de Boleto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-base md:text-lg font-semibold">1. Criar Boleto</h3>
                <div className="bg-gray-50 p-3 md:p-4 rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-sm">URL:</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("https://token.bigcorps.com.br/boleto/criar")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="block bg-white p-2 rounded border text-xs md:text-sm break-all">
                    https://token.bigcorps.com.br/boleto/criar
                  </code>
                  
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-sm">Método:</Label>
                  </div>
                  <code className="block bg-white p-2 rounded border text-xs md:text-sm">POST</code>
                  
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
                        "valor": "{{valor}}",
                        "vencimento": "{{vencimento}}",
                        "nomePagador": "{{nomePagador}}",
                        "cpfCnpjPagador": "{{cpfCnpjPagador}}",
                        "enderecoPagador": {
                          "logradouro": "{{logradouro}}",
                          "numero": "{{numero}}",
                          "bairro": "{{bairro}}",
                          "cidade": "{{cidade}}",
                          "uf": "{{uf}}",
                          "cep": "{{cep}}"
                        }
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
                      "valor": "{{valor}}",
                      "vencimento": "{{vencimento}}",
                      "nomePagador": "{{nomePagador}}",
                      "cpfCnpjPagador": "{{cpfCnpjPagador}}",
                      "enderecoPagador": {
                        "logradouro": "{{logradouro}}",
                        "numero": "{{numero}}",
                        "bairro": "{{bairro}}",
                        "cidade": "{{cidade}}",
                        "uf": "{{uf}}",
                        "cep": "{{cep}}"
                      }
                    }, null, 2)}
                  </code>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-base md:text-lg font-semibold">2. Consultar Status do Boleto</h3>
                <div className="bg-gray-50 p-3 md:p-4 rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-sm">URL:</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("https://token.bigcorps.com.br/boleto/status/{{nossoNumero}}")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="block bg-white p-2 rounded border text-xs md:text-sm break-all">
                    https://token.bigcorps.com.br/boleto/status/{"{{nossoNumero}}"}
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
                        "accessToken": "{{accessToken}}"
                      }, null, 2))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="block bg-white p-2 rounded border text-xs md:text-sm whitespace-pre overflow-x-auto">
                    {JSON.stringify({
                      "banco": "{{banco}}",
                      "clientId": "{{clientId}}",
                      "accessToken": "{{accessToken}}"
                    }, null, 2)}
                  </code>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-md p-3 md:p-4">
                <h4 className="font-semibold text-purple-800 mb-2 text-sm md:text-base">Campos Obrigatórios:</h4>
                <ul className="text-xs md:text-sm text-purple-700 space-y-1">
                  <li>• <strong>banco</strong> - ITAU ou INTER</li>
                  <li>• <strong>valor</strong> - Valor do boleto em decimal (ex: 100.50)</li>
                  <li>• <strong>vencimento</strong> - Data no formato YYYY-MM-DD</li>
                  <li>• <strong>nomePagador</strong> - Nome completo do pagador</li>
                  <li>• <strong>cpfCnpjPagador</strong> - CPF ou CNPJ do pagador</li>
                  <li>• <strong>enderecoPagador</strong> - Endereço completo do pagador</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 md:p-4">
                <h4 className="font-semibold text-blue-800 mb-2 text-sm md:text-base">Observações:</h4>
                <ul className="text-xs md:text-sm text-blue-700 space-y-1">
                  <li>• Substitua as variáveis {"{{variavel}}"} pelos valores reais</li>
                  <li>• O nossoNumero é retornado na criação do boleto</li>
                  <li>• Use o accessToken obtido da API de autenticação</li>
                  <li>• A data de vencimento deve ser futura</li>
                  <li>• O CEP deve conter apenas números</li>
                  <li>• Campos opcionais: complemento, descrição, instruções</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {boletoResult && (
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-800">Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-white p-4 rounded-md border border-purple-200 overflow-auto">
              {JSON.stringify(boletoResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
