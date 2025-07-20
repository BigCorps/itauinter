import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Key, RefreshCw, Eye, EyeOff, Copy, ExternalLink, Zap, Clock } from "lucide-react";
import { FileUpload } from "../components/FileUpload";
import { API_BASE_URL } from "../config";
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

  const [poolRequest, setPoolRequest] = useState({
    clientId: "",
    banco: "",
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

  const handleGetPoolToken = async () => {
    if (!poolRequest.clientId || !poolRequest.banco) {
      toast({
        title: "Erro",
        description: "Client ID e Banco são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await backend.auth.getPoolToken({
        clientId: poolRequest.clientId,
        banco: poolRequest.banco,
      });
      setTokenData(response);
      toast({
        title: "Sucesso",
        description: `Token obtido do ${poolRequest.banco === "ITAU" ? "pool" : "cache"}!`,
      });
    } catch (error) {
      console.error("Erro ao obter token do pool:", error);
      toast({
        title: "Erro",
        description: "Falha ao obter token. Verifique se já existe um token gerado.",
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center justify-center space-x-2">
          <Key className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
          <span>Gerar Token Bancário</span>
        </h1>
        <p className="text-sm md:text-base text-gray-600 px-4">
          Gere tokens de acesso para as APIs dos bancos usando diferentes métodos de autenticação
        </p>
      </div>

      <Tabs defaultValue="pool" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 text-xs md:text-sm">
          <TabsTrigger value="pool" className="px-2 md:px-4">Pool Otimizado</TabsTrigger>
          <TabsTrigger value="credentials" className="px-2 md:px-4">Client Credentials</TabsTrigger>
          <TabsTrigger value="jwt" className="px-2 md:px-4">JWT + mTLS</TabsTrigger>
          <TabsTrigger value="api" className="px-2 md:px-4">API</TabsTrigger>
        </TabsList>

        <TabsContent value="pool">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                <span>Pool de Tokens Otimizado</span>
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                Obtenha tokens de forma otimizada para alta demanda. Itaú usa pool de múltiplos tokens, Inter usa cache de longa duração.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Estratégias por Banco:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-blue-700">Itaú (5 minutos)</h4>
                    <ul className="text-blue-600 space-y-1">
                      <li>• Pool de 3-5 tokens simultâneos</li>
                      <li>• Distribuição round-robin</li>
                      <li>• Renovação proativa</li>
                      <li>• Ideal para alta demanda</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-700">Inter (2 anos)</h4>
                    <ul className="text-blue-600 space-y-1">
                      <li>• Token único de longa duração</li>
                      <li>• Cache inteligente</li>
                      <li>• Renovação apenas quando necessário</li>
                      <li>• Máxima eficiência</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="poolClientId">Client ID</Label>
                  <Input
                    id="poolClientId"
                    value={poolRequest.clientId}
                    onChange={(e) => setPoolRequest({ ...poolRequest, clientId: e.target.value })}
                    placeholder="Seu Client ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="poolBanco">Banco</Label>
                  <Select value={poolRequest.banco} onValueChange={(value) => setPoolRequest({ ...poolRequest, banco: value })}>
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
              </div>

              <Button onClick={handleGetPoolToken} disabled={loading} className="w-full">
                <Zap className="h-4 w-4 mr-2" />
                {loading ? "Obtendo..." : "Obter Token do Pool"}
              </Button>

              <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-md">
                <strong>Nota:</strong> Este método requer que você já tenha gerado pelo menos um token usando as abas "Client Credentials" ou "JWT + mTLS".
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credentials">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Client Credentials Flow</CardTitle>
              <CardDescription className="text-sm md:text-base">
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
                      className="pr-10"
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

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Button onClick={handleGenerateToken} disabled={loading} className="flex-1">
                  {loading ? "Gerando..." : "Gerar Token"}
                </Button>
                <Button onClick={handleRefreshToken} disabled={loading} variant="outline" className="sm:w-auto">
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
              <CardTitle className="text-lg md:text-xl">JWT + mTLS Flow</CardTitle>
              <CardDescription className="text-sm md:text-base">
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
                  className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm resize-none"
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

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg md:text-xl">
                <ExternalLink className="h-5 w-5" />
                <span>Documentação da API</span>
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                URLs, headers e bodies para integração com APIs externas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-md p-3 md:p-4">
                <h4 className="font-semibold text-green-800 mb-2 text-sm md:text-base">🚀 Deploy em Produção:</h4>
                <div className="text-xs md:text-sm text-green-700 space-y-1">
                  <p><strong>Backend (Railway):</strong> {API_BASE_URL}</p>
                  <p><strong>Frontend (Vercel):</strong> https://token-bancario.vercel.app</p>
                  <p><strong>Status:</strong> ✅ Escalabilidade automática ativada</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-base md:text-lg font-semibold flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  <span>1. Obter Token do Pool (Recomendado)</span>
                </h3>
                <div className="bg-gray-50 p-3 md:p-4 rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-sm">URL:</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`${API_BASE_URL}/auth/pool/{{clientId}}`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="block bg-white p-2 rounded border text-xs md:text-sm break-all">
                    {API_BASE_URL}/auth/pool/{"{{clientId}}"}
                  </code>
                  
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-sm">Método:</Label>
                  </div>
                  <code className="block bg-white p-2 rounded border text-xs md:text-sm">GET</code>
                  
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-sm">Query Parameters:</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("banco={{banco}}")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="block bg-white p-2 rounded border text-xs md:text-sm">
                    banco={"{{banco}}"}
                  </code>
                  
                  <div className="bg-green-50 border border-green-200 rounded p-2 mt-2">
                    <p className="text-xs text-green-700">
                      <strong>Vantagem:</strong> Automaticamente obtém o melhor token disponível do pool (Itaú) ou cache (Inter)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-base md:text-lg font-semibold">2. Gerar Token Manual</h3>
                <div className="bg-gray-50 p-3 md:p-4 rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-sm">URL:</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`${API_BASE_URL}/auth/token`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="block bg-white p-2 rounded border text-xs md:text-sm break-all">
                    {API_BASE_URL}/auth/token
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
                        "clientSecret": "{{clientSecret}}",
                        "certificateContent": "{{certificateBase64}}",
                        "privateKeyContent": "{{privateKeyBase64}}"
                      }, null, 2))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="block bg-white p-2 rounded border text-xs md:text-sm whitespace-pre overflow-x-auto">
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
                <h3 className="text-base md:text-lg font-semibold">3. Gerar Token JWT</h3>
                <div className="bg-gray-50 p-3 md:p-4 rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-sm">URL:</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`${API_BASE_URL}/auth/jwt-token`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="block bg-white p-2 rounded border text-xs md:text-sm break-all">
                    {API_BASE_URL}/auth/jwt-token
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
                        "privateKeyJwt": "{{privateKeyJwt}}",
                        "certificateContent": "{{certificateBase64}}",
                        "privateKeyContent": "{{privateKeyBase64}}"
                      }, null, 2))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="block bg-white p-2 rounded border text-xs md:text-sm whitespace-pre overflow-x-auto">
                    {JSON.stringify({
                      "banco": "{{banco}}",
                      "clientId": "{{clientId}}",
                      "privateKeyJwt": "{{privateKeyJwt}}",
                      "certificateContent": "{{certificateBase64}}",
                      "privateKeyContent": "{{privateKeyBase64}}"
                    }, null, 2)}
                  </code>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 md:p-4">
                <h4 className="font-semibold text-blue-800 mb-2 text-sm md:text-base flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Estratégias de Token por Banco:</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-blue-700 mb-1">Itaú (5 minutos)</h5>
                    <ul className="text-xs md:text-sm text-blue-600 space-y-1">
                      <li>• Use sempre o endpoint de pool</li>
                      <li>• Sistema mantém 3-5 tokens válidos</li>
                      <li>• Renovação automática proativa</li>
                      <li>• Ideal para alta demanda</li>
                      <li>• Fallback automático se um token falha</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-700 mb-1">Inter (2 anos)</h5>
                    <ul className="text-xs md:text-sm text-blue-600 space-y-1">
                      <li>• Gere o token uma vez</li>
                      <li>• Cache localmente por até 1 ano</li>
                      <li>• Use o endpoint de pool para otimização</li>
                      <li>• Renovação apenas quando necessário</li>
                      <li>• Máxima eficiência e economia</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 md:p-4">
                <h4 className="font-semibold text-yellow-800 mb-2 text-sm md:text-base">Observações para Integração:</h4>
                <ul className="text-xs md:text-sm text-yellow-700 space-y-1">
                  <li>• <strong>Recomendado:</strong> Use sempre o endpoint de pool para obter tokens</li>
                  <li>• Substitua as variáveis {"{{variavel}}"} pelos valores reais</li>
                  <li>• Para banco use: ITAU ou INTER</li>
                  <li>• O certificado e chave privada devem estar em formato Base64</li>
                  <li>• <strong>Itaú:</strong> Pool automático, sem necessidade de gerenciar expiração</li>
                  <li>• <strong>Inter:</strong> Cache inteligente, token válido por 2 anos</li>
                  <li>• Implemente retry automático para máxima confiabilidade</li>
                  <li>• <strong>Railway:</strong> Escalabilidade automática ativada</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {tokenData && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 text-lg md:text-xl flex items-center space-x-2">
              <span>Token Gerado com Sucesso</span>
              {tokenData.strategy === "pool" && <Zap className="h-5 w-5 text-yellow-600" />}
            </CardTitle>
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
                  <code className="text-xs md:text-sm break-all">{tokenData.accessToken}</code>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-green-700">Tipo</Label>
                <div className="mt-1 p-3 bg-white border border-green-200 rounded-md">
                  <code className="text-xs md:text-sm">{tokenData.tokenType}</code>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-green-700">Expira em</Label>
                <div className="mt-1 p-3 bg-white border border-green-200 rounded-md">
                  <code className="text-xs md:text-sm">{tokenData.expiresIn} segundos</code>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-green-700">Gerado em</Label>
                <div className="mt-1 p-3 bg-white border border-green-200 rounded-md">
                  <code className="text-xs md:text-sm">{new Date(tokenData.generatedAt).toLocaleString()}</code>
                </div>
              </div>
              {tokenData.remainingTime !== undefined && (
                <div>
                  <Label className="text-sm font-medium text-green-700">Tempo Restante</Label>
                  <div className="mt-1 p-3 bg-white border border-green-200 rounded-md">
                    <code className="text-xs md:text-sm">{tokenData.remainingTime} segundos</code>
                  </div>
                </div>
              )}
              {tokenData.poolId && (
                <div>
                  <Label className="text-sm font-medium text-green-700">Pool ID</Label>
                  <div className="mt-1 p-3 bg-white border border-green-200 rounded-md">
                    <code className="text-xs md:text-sm">{tokenData.poolId}</code>
                  </div>
                </div>
              )}
            </div>
            
            {tokenData.strategy && (
              <div className="bg-white border border-green-200 rounded-md p-3">
                <Label className="text-sm font-medium text-green-700">Estratégia</Label>
                <div className="mt-1 flex items-center space-x-2">
                  {tokenData.strategy === "pool" && <Zap className="h-4 w-4 text-yellow-600" />}
                  <span className="text-sm text-green-600 capitalize">
                    {tokenData.strategy === "pool" ? "Pool Otimizado" : "Token Único"}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
