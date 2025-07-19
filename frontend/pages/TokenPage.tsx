import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Key, RefreshCw, Eye, EyeOff, Copy, ExternalLink } from "lucide-react";
import { FileUpload } from "../components/FileUpload";
import backend from "~backend/client";

export function TokenPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [tokenData, setTokenData] = useState<any>(null);

  const [credentials, setCredentials] = useState({
    banco: "",
    clientId: "",
    clientSecret: "",
    certificateContent: "",
    privateKeyContent: "",
  });

  const [jwtCredentials, setJwtCredentials] = useState({
    banco: "",
    clientId: "",
    privateKeyJwt: "",
    certificateContent: "",
    privateKeyContent: "",
  });

  const handleGenerateToken = async () => {
    if (!credentials.banco || !credentials.clientId || !credentials.clientSecret || !credentials.certificateContent || !credentials.privateKeyContent) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await backend.auth.generateToken(credentials);
      setTokenData(response);
      toast({
        title: "Sucesso",
        description: "Token gerado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao gerar token:", error);
      toast({
        title: "Erro",
        description: "Falha ao gerar token. Verifique suas credenciais.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateJWTToken = async () => {
    if (!jwtCredentials.banco || !jwtCredentials.clientId || !jwtCredentials.privateKeyJwt || !jwtCredentials.certificateContent || !jwtCredentials.privateKeyContent) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await backend.auth.generateJWTToken(jwtCredentials);
      setTokenData(response);
      toast({
        title: "Sucesso",
        description: "Token JWT gerado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao gerar token JWT:", error);
      toast({
        title: "Erro",
        description: "Falha ao gerar token JWT. Verifique suas credenciais.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshToken = async () => {
    if (!credentials.clientId) {
      toast({
        title: "Erro",
        description: "Client ID é obrigatório para renovar o token",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await backend.auth.refreshToken({ 
        clientId: credentials.clientId,
        banco: credentials.banco 
      });
      setTokenData(response);
      toast({
        title: "Sucesso",
        description: "Token renovado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao renovar token:", error);
      toast({
        title: "Erro",
        description: "Falha ao renovar token.",
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

  const bancos = [
    { value: "ITAU", label: "Banco Itaú" },
    { value: "INTER", label: "Banco Inter" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center space-x-2">
          <Key className="h-8 w-8 text-blue-600" />
          <span>Gerar Token Bancário</span>
        </h1>
        <p className="text-gray-600">
          Gere tokens de acesso para as APIs dos bancos usando diferentes métodos de autenticação
        </p>
      </div>

      <Tabs defaultValue="credentials" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="credentials">Client Credentials</TabsTrigger>
          <TabsTrigger value="jwt">JWT + mTLS</TabsTrigger>
          <TabsTrigger value="typebot">Para Typebot</TabsTrigger>
        </TabsList>

        <TabsContent value="credentials">
          <Card>
            <CardHeader>
              <CardTitle>Client Credentials Flow</CardTitle>
              <CardDescription>
                Método padrão de autenticação usando client_id e client_secret
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="banco">Banco</Label>
                <Select value={credentials.banco} onValueChange={(value) => setCredentials({ ...credentials, banco: value })}>
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
                  <Label htmlFor="clientId">Client ID</Label>
                  <Input
                    id="clientId"
                    value={credentials.clientId}
                    onChange={(e) => setCredentials({ ...credentials, clientId: e.target.value })}
                    placeholder="Seu Client ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientSecret">Client Secret</Label>
                  <div className="relative">
                    <Input
                      id="clientSecret"
                      type={showSecrets ? "text" : "password"}
                      value={credentials.clientSecret}
                      onChange={(e) => setCredentials({ ...credentials, clientSecret: e.target.value })}
                      placeholder="Seu Client Secret"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowSecrets(!showSecrets)}
                    >
                      {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <FileUpload
                label="Certificado (.crt)"
                value={credentials.certificateContent}
                onChange={(value) => setCredentials({ ...credentials, certificateContent: value })}
                placeholder="Cole o conteúdo do seu certificado aqui ou carregue o arquivo..."
                accept=".crt,.pem"
              />

              <FileUpload
                label="Chave Privada (.key)"
                value={credentials.privateKeyContent}
                onChange={(value) => setCredentials({ ...credentials, privateKeyContent: value })}
                placeholder="Cole o conteúdo da sua chave privada aqui ou carregue o arquivo..."
                accept=".key,.pem"
              />

              <div className="flex space-x-2">
                <Button onClick={handleGenerateToken} disabled={loading} className="flex-1">
                  {loading ? "Gerando..." : "Gerar Token"}
                </Button>
                <Button onClick={handleRefreshToken} disabled={loading} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Renovar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jwt">
          <Card>
            <CardHeader>
              <CardTitle>JWT + mTLS Flow</CardTitle>
              <CardDescription>
                Método avançado usando JWT para maior segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jwtBanco">Banco</Label>
                <Select value={jwtCredentials.banco} onValueChange={(value) => setJwtCredentials({ ...jwtCredentials, banco: value })}>
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

              <div className="space-y-2">
                <Label htmlFor="jwtClientId">Client ID</Label>
                <Input
                  id="jwtClientId"
                  value={jwtCredentials.clientId}
                  onChange={(e) => setJwtCredentials({ ...jwtCredentials, clientId: e.target.value })}
                  placeholder="Seu Client ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="privateKeyJwt">Private Key JWT</Label>
                <textarea
                  id="privateKeyJwt"
                  value={jwtCredentials.privateKeyJwt}
                  onChange={(e) => setJwtCredentials({ ...jwtCredentials, privateKeyJwt: e.target.value })}
                  placeholder="Cole seu JWT assinado aqui..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm"
                />
              </div>

              <FileUpload
                label="Certificado (.crt)"
                value={jwtCredentials.certificateContent}
                onChange={(value) => setJwtCredentials({ ...jwtCredentials, certificateContent: value })}
                placeholder="Cole o conteúdo do seu certificado aqui ou carregue o arquivo..."
                accept=".crt,.pem"
              />

              <FileUpload
                label="Chave Privada (.key)"
                value={jwtCredentials.privateKeyContent}
                onChange={(value) => setJwtCredentials({ ...jwtCredentials, privateKeyContent: value })}
                placeholder="Cole o conteúdo da sua chave privada aqui ou carregue o arquivo..."
                accept=".key,.pem"
              />

              <Button onClick={handleGenerateJWTToken} disabled={loading} className="w-full">
                {loading ? "Gerando..." : "Gerar Token JWT"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typebot">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ExternalLink className="h-5 w-5" />
                <span>Configuração para Typebot</span>
              </CardTitle>
              <CardDescription>
                URLs, headers e bodies para usar no Typebot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">1. Gerar Token</h3>
                <div className="bg-gray-50 p-4 rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">URL:</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("https://token.bigcorps.com.br/auth/token")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="block bg-white p-2 rounded border text-sm">
                    https://token.bigcorps.com.br/auth/token
                  </code>
                  
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Método:</Label>
                  </div>
                  <code className="block bg-white p-2 rounded border text-sm">POST</code>
                  
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Headers:</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('{"Content-Type": "application/json"}')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="block bg-white p-2 rounded border text-sm">
                    {JSON.stringify({"Content-Type": "application/json"}, null, 2)}
                  </code>
                  
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Body:</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify({
                        "banco": "{{banco}}",
                        "clientId": "{{clientId}}",
                        "clientSecret": "{{clientSecret}}",
                        "certificateContent": "{{certificateBase64}}",
                        "privateKeyContent": "{{privateKeyBase64}}"
                      }, null, 2))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="block bg-white p-2 rounded border text-sm whitespace-pre">
                    {JSON.stringify({
                      "banco": "{{banco}}",
                      "clientId": "{{clientId}}",
                      "clientSecret": "{{clientSecret}}",
                      "certificateContent": "{{certificateBase64}}",
                      "privateKeyContent": "{{privateKeyBase64}}"
                    }, null, 2)}
                  </code>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold">2. Criar Pagamento PIX</h3>
                <div className="bg-gray-50 p-4 rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">URL:</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("https://token.bigcorps.com.br/pix/pagamento")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="block bg-white p-2 rounded border text-sm">
                    https://token.bigcorps.com.br/pix/pagamento
                  </code>
                  
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Método:</Label>
                  </div>
                  <code className="block bg-white p-2 rounded border text-sm">POST</code>
                  
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Headers:</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('{"Content-Type": "application/json"}')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="block bg-white p-2 rounded border text-sm">
                    {JSON.stringify({"Content-Type": "application/json"}, null, 2)}
                  </code>
                  
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Body:</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify({
                        "banco": "{{banco}}",
                        "clientId": "{{clientId}}",
                        "accessToken": "{{accessToken}}",
                        "valor": "{{valor}}",
                        "chaveDestinatario": "{{chaveDestinatario}}",
                        "tipoChave": "{{tipoChave}}",
                        "descricao": "{{descricao}}",
                        "nomeDestinatario": "{{nomeDestinatario}}"
                      }, null, 2))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="block bg-white p-2 rounded border text-sm whitespace-pre">
                    {JSON.stringify({
                      "banco": "{{banco}}",
                      "clientId": "{{clientId}}",
                      "accessToken": "{{accessToken}}",
                      "valor": "{{valor}}",
                      "chaveDestinatario": "{{chaveDestinatario}}",
                      "tipoChave": "{{tipoChave}}",
                      "descricao": "{{descricao}}",
                      "nomeDestinatario": "{{nomeDestinatario}}"
                    }, null, 2)}
                  </code>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold">3. Gerar QR Code PIX</h3>
                <div className="bg-gray-50 p-4 rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">URL:</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("https://token.bigcorps.com.br/pix/recebimento")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="block bg-white p-2 rounded border text-sm">
                    https://token.bigcorps.com.br/pix/recebimento
                  </code>
                  
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Body:</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify({
                        "banco": "{{banco}}",
                        "clientId": "{{clientId}}",
                        "accessToken": "{{accessToken}}",
                        "valor": "{{valor}}",
                        "chaveRecebimento": "{{chaveRecebimento}}",
                        "tipoChave": "{{tipoChave}}",
                        "descricao": "{{descricao}}"
                      }, null, 2))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="block bg-white p-2 rounded border text-sm whitespace-pre">
                    {JSON.stringify({
                      "banco": "{{banco}}",
                      "clientId": "{{clientId}}",
                      "accessToken": "{{accessToken}}",
                      "valor": "{{valor}}",
                      "chaveRecebimento": "{{chaveRecebimento}}",
                      "tipoChave": "{{tipoChave}}",
                      "descricao": "{{descricao}}"
                    }, null, 2)}
                  </code>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold">4. Criar Boleto</h3>
                <div className="bg-gray-50 p-4 rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">URL:</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("https://token.bigcorps.com.br/boleto/criar")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="block bg-white p-2 rounded border text-sm">
                    https://token.bigcorps.com.br/boleto/criar
                  </code>
                  
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Body:</Label>
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
                  <code className="block bg-white p-2 rounded border text-sm whitespace-pre">
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
                <h3 className="text-lg font-semibold">5. Consultar Saldo</h3>
                <div className="bg-gray-50 p-4 rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">URL:</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("https://token.bigcorps.com.br/account/saldo")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="block bg-white p-2 rounded border text-sm">
                    https://token.bigcorps.com.br/account/saldo
                  </code>
                  
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Método:</Label>
                  </div>
                  <code className="block bg-white p-2 rounded border text-sm">GET</code>
                  
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Body:</Label>
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
                  <code className="block bg-white p-2 rounded border text-sm whitespace-pre">
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

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Observações para Typebot:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Substitua as variáveis {"{{variavel}}"} pelos valores reais ou variáveis do Typebot</li>
                  <li>• Para banco use: ITAU ou INTER</li>
                  <li>• O certificado e chave privada devem estar em formato Base64</li>
                  <li>• Todos os endpoints retornam JSON</li>
                  <li>• O token expira em 5 minutos (300 segundos)</li>
                  <li>• Para tipos de chave PIX use: CPF, CNPJ, EMAIL, TELEFONE, CHAVE_ALEATORIA</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {tokenData && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Token Gerado com Sucesso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-sm font-medium text-green-700">Access Token</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(tokenData.accessToken)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-3 bg-white border border-green-200 rounded-md">
                  <code className="text-sm break-all">{tokenData.accessToken}</code>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-green-700">Tipo</Label>
                <div className="mt-1 p-3 bg-white border border-green-200 rounded-md">
                  <code className="text-sm">{tokenData.tokenType}</code>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-green-700">Expira em</Label>
                <div className="mt-1 p-3 bg-white border border-green-200 rounded-md">
                  <code className="text-sm">{tokenData.expiresIn} segundos</code>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-green-700">Gerado em</Label>
                <div className="mt-1 p-3 bg-white border border-green-200 rounded-md">
                  <code className="text-sm">{new Date(tokenData.generatedAt).toLocaleString()}</code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
