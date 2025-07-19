import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { CreditCard, QrCode, Search } from "lucide-react";
import backend from "~backend/client";

export function PixPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pixResult, setPixResult] = useState<any>(null);

  const [paymentData, setPaymentData] = useState({
    banco: "",
    clientId: "",
    accessToken: "",
    valor: "",
    chaveDestinatario: "",
    tipoChave: "",
    descricao: "",
    nomeDestinatario: "",
  });

  const [receiveData, setReceiveData] = useState({
    banco: "",
    clientId: "",
    accessToken: "",
    valor: "",
    descricao: "",
    chaveRecebimento: "",
    tipoChave: "",
  });

  const [statusData, setStatusData] = useState({
    banco: "",
    clientId: "",
    accessToken: "",
    idTransacao: "",
  });

  const handleCreatePayment = async () => {
    if (!paymentData.banco || !paymentData.clientId || !paymentData.accessToken || !paymentData.valor || !paymentData.chaveDestinatario || !paymentData.tipoChave) {
      toast({
        title: "Erro",
        description: "Campos obrigatórios: Banco, Client ID, Access Token, Valor, Chave e Tipo de Chave",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await backend.pix.createPix({
        ...paymentData,
        valor: parseFloat(paymentData.valor),
      });
      setPixResult(response);
      toast({
        title: "Sucesso",
        description: "Pagamento PIX criado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao criar PIX:", error);
      toast({
        title: "Erro",
        description: "Falha ao criar pagamento PIX.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReceive = async () => {
    if (!receiveData.banco || !receiveData.clientId || !receiveData.accessToken || !receiveData.chaveRecebimento || !receiveData.tipoChave) {
      toast({
        title: "Erro",
        description: "Campos obrigatórios: Banco, Client ID, Access Token, Chave e Tipo de Chave",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await backend.pix.createPixReceive({
        ...receiveData,
        valor: receiveData.valor ? parseFloat(receiveData.valor) : undefined,
      });
      setPixResult(response);
      toast({
        title: "Sucesso",
        description: "QR Code PIX gerado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao criar PIX recebimento:", error);
      toast({
        title: "Erro",
        description: "Falha ao gerar QR Code PIX.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!statusData.banco || !statusData.clientId || !statusData.accessToken || !statusData.idTransacao) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await backend.pix.getPixStatus(statusData);
      setPixResult(response);
      toast({
        title: "Sucesso",
        description: "Status consultado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao consultar status:", error);
      toast({
        title: "Erro",
        description: "Falha ao consultar status do PIX.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const bancos = [
    { value: "ITAU", label: "Banco Itaú" },
    { value: "INTER", label: "Banco Inter" },
  ];

  const tiposChave = [
    { value: "CPF", label: "CPF" },
    { value: "CNPJ", label: "CNPJ" },
    { value: "EMAIL", label: "E-mail" },
    { value: "TELEFONE", label: "Telefone" },
    { value: "CHAVE_ALEATORIA", label: "Chave Aleatória" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center space-x-2">
          <CreditCard className="h-8 w-8 text-green-600" />
          <span>PIX</span>
        </h1>
        <p className="text-gray-600">
          Gerencie pagamentos e recebimentos PIX
        </p>
      </div>

      <Tabs defaultValue="payment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payment">Pagamento</TabsTrigger>
          <TabsTrigger value="receive">Recebimento</TabsTrigger>
          <TabsTrigger value="status">Consultar Status</TabsTrigger>
        </TabsList>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Criar Pagamento PIX</CardTitle>
              <CardDescription>
                Envie um pagamento PIX para uma chave específica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payBanco">Banco</Label>
                <Select value={paymentData.banco} onValueChange={(value) => setPaymentData({ ...paymentData, banco: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o banco" />
                  </SelectTrigger>
                  <SelectContent>
                    {bancos.map((banco) => (
                      <SelectItem key={banco.value} value={banco.value}>
                        {banco.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payClientId">Client ID</Label>
                  <Input
                    id="payClientId"
                    value={paymentData.clientId}
                    onChange={(e) => setPaymentData({ ...paymentData, clientId: e.target.value })}
                    placeholder="Seu Client ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payAccessToken">Access Token</Label>
                  <Input
                    id="payAccessToken"
                    value={paymentData.accessToken}
                    onChange={(e) => setPaymentData({ ...paymentData, accessToken: e.target.value })}
                    placeholder="Token de acesso"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payValor">Valor (R$)</Label>
                  <Input
                    id="payValor"
                    type="number"
                    step="0.01"
                    value={paymentData.valor}
                    onChange={(e) => setPaymentData({ ...paymentData, valor: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payTipoChave">Tipo de Chave</Label>
                  <Select value={paymentData.tipoChave} onValueChange={(value) => setPaymentData({ ...paymentData, tipoChave: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposChave.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payChave">Chave PIX</Label>
                  <Input
                    id="payChave"
                    value={paymentData.chaveDestinatario}
                    onChange={(e) => setPaymentData({ ...paymentData, chaveDestinatario: e.target.value })}
                    placeholder="Chave do destinatário"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payNome">Nome do Destinatário</Label>
                  <Input
                    id="payNome"
                    value={paymentData.nomeDestinatario}
                    onChange={(e) => setPaymentData({ ...paymentData, nomeDestinatario: e.target.value })}
                    placeholder="Nome (opcional)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payDescricao">Descrição</Label>
                  <Input
                    id="payDescricao"
                    value={paymentData.descricao}
                    onChange={(e) => setPaymentData({ ...paymentData, descricao: e.target.value })}
                    placeholder="Descrição (opcional)"
                  />
                </div>
              </div>

              <Button onClick={handleCreatePayment} disabled={loading} className="w-full">
                {loading ? "Processando..." : "Criar Pagamento PIX"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receive">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="h-5 w-5" />
                <span>Gerar QR Code PIX</span>
              </CardTitle>
              <CardDescription>
                Crie um QR Code para receber pagamentos PIX
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recBanco">Banco</Label>
                <Select value={receiveData.banco} onValueChange={(value) => setReceiveData({ ...receiveData, banco: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o banco" />
                  </SelectTrigger>
                  <SelectContent>
                    {bancos.map((banco) => (
                      <SelectItem key={banco.value} value={banco.value}>
                        {banco.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recClientId">Client ID</Label>
                  <Input
                    id="recClientId"
                    value={receiveData.clientId}
                    onChange={(e) => setReceiveData({ ...receiveData, clientId: e.target.value })}
                    placeholder="Seu Client ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recAccessToken">Access Token</Label>
                  <Input
                    id="recAccessToken"
                    value={receiveData.accessToken}
                    onChange={(e) => setReceiveData({ ...receiveData, accessToken: e.target.value })}
                    placeholder="Token de acesso"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recValor">Valor (R$) - Opcional</Label>
                  <Input
                    id="recValor"
                    type="number"
                    step="0.01"
                    value={receiveData.valor}
                    onChange={(e) => setReceiveData({ ...receiveData, valor: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recTipoChave">Tipo de Chave</Label>
                  <Select value={receiveData.tipoChave} onValueChange={(value) => setReceiveData({ ...receiveData, tipoChave: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposChave.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recChave">Sua Chave PIX</Label>
                  <Input
                    id="recChave"
                    value={receiveData.chaveRecebimento}
                    onChange={(e) => setReceiveData({ ...receiveData, chaveRecebimento: e.target.value })}
                    placeholder="Sua chave PIX"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recDescricao">Descrição</Label>
                <Input
                  id="recDescricao"
                  value={receiveData.descricao}
                  onChange={(e) => setReceiveData({ ...receiveData, descricao: e.target.value })}
                  placeholder="Descrição (opcional)"
                />
              </div>

              <Button onClick={handleCreateReceive} disabled={loading} className="w-full">
                {loading ? "Gerando..." : "Gerar QR Code PIX"}
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
                Verifique o status de uma transação PIX
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="statusBanco">Banco</Label>
                <Select value={statusData.banco} onValueChange={(value) => setStatusData({ ...statusData, banco: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o banco" />
                  </SelectTrigger>
                  <SelectContent>
                    {bancos.map((banco) => (
                      <SelectItem key={banco.value} value={banco.value}>
                        {banco.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                  <Label htmlFor="statusIdTransacao">ID da Transação</Label>
                  <Input
                    id="statusIdTransacao"
                    value={statusData.idTransacao}
                    onChange={(e) => setStatusData({ ...statusData, idTransacao: e.target.value })}
                    placeholder="ID da transação PIX"
                  />
                </div>
              </div>

              <Button onClick={handleCheckStatus} disabled={loading} className="w-full">
                {loading ? "Consultando..." : "Consultar Status"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {pixResult && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-white p-4 rounded-md border border-blue-200 overflow-auto">
              {JSON.stringify(pixResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
