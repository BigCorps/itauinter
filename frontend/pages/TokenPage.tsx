import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Key, RefreshCw, Eye, EyeOff } from "lucide-react";
import backend from "~backend/client";

export function TokenPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [tokenData, setTokenData] = useState<any>(null);

  const [credentials, setCredentials] = useState({
    clientId: "",
    clientSecret: "",
    certificateContent: "",
    privateKeyContent: "",
  });

  const [jwtCredentials, setJwtCredentials] = useState({
    clientId: "",
    privateKeyJwt: "",
    certificateContent: "",
    privateKeyContent: "",
  });

  const handleGenerateToken = async () => {
    if (!credentials.clientId || !credentials.clientSecret || !credentials.certificateContent || !credentials.privateKeyContent) {
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
    if (!jwtCredentials.clientId || !jwtCredentials.privateKeyJwt || !jwtCredentials.certificateContent || !jwtCredentials.privateKeyContent) {
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
      const response = await backend.auth.refreshToken({ clientId: credentials.clientId });
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

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center space-x-2">
          <Key className="h-8 w-8 text-blue-600" />
          <span>Geração de Token Itaú</span>
        </h1>
        <p className="text-gray-600">
          Gere tokens de acesso para as APIs do Itaú usando diferentes métodos de autenticação
        </p>
      </div>

      <Tabs defaultValue="credentials" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="credentials">Client Credentials</TabsTrigger>
          <TabsTrigger value="jwt">JWT + mTLS</TabsTrigger>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client ID</Label>
                  <Input
                    id="clientId"
                    value={credentials.clientId}
                    onChange={(e) => setCredentials({ ...credentials, clientId: e.target.value })}
                    placeholder="Seu Client ID do Itaú"
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
                      placeholder="Seu Client Secret do Itaú"
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

              <div className="space-y-2">
                <Label htmlFor="certificate">Certificado (.crt)</Label>
                <Textarea
                  id="certificate"
                  value={credentials.certificateContent}
                  onChange={(e) => setCredentials({ ...credentials, certificateContent: e.target.value })}
                  placeholder="Cole o conteúdo do seu certificado aqui..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="privateKey">Chave Privada (.key)</Label>
                <Textarea
                  id="privateKey"
                  value={credentials.privateKeyContent}
                  onChange={(e) => setCredentials({ ...credentials, privateKeyContent: e.target.value })}
                  placeholder="Cole o conteúdo da sua chave privada aqui..."
                  rows={6}
                />
              </div>

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
                <Label htmlFor="jwtClientId">Client ID</Label>
                <Input
                  id="jwtClientId"
                  value={jwtCredentials.clientId}
                  onChange={(e) => setJwtCredentials({ ...jwtCredentials, clientId: e.target.value })}
                  placeholder="Seu Client ID do Itaú"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="privateKeyJwt">Private Key JWT</Label>
                <Textarea
                  id="privateKeyJwt"
                  value={jwtCredentials.privateKeyJwt}
                  onChange={(e) => setJwtCredentials({ ...jwtCredentials, privateKeyJwt: e.target.value })}
                  placeholder="Cole seu JWT assinado aqui..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jwtCertificate">Certificado (.crt)</Label>
                <Textarea
                  id="jwtCertificate"
                  value={jwtCredentials.certificateContent}
                  onChange={(e) => setJwtCredentials({ ...jwtCredentials, certificateContent: e.target.value })}
                  placeholder="Cole o conteúdo do seu certificado aqui..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jwtPrivateKey">Chave Privada (.key)</Label>
                <Textarea
                  id="jwtPrivateKey"
                  value={jwtCredentials.privateKeyContent}
                  onChange={(e) => setJwtCredentials({ ...jwtCredentials, privateKeyContent: e.target.value })}
                  placeholder="Cole o conteúdo da sua chave privada aqui..."
                  rows={6}
                />
              </div>

              <Button onClick={handleGenerateJWTToken} disabled={loading} className="w-full">
                {loading ? "Gerando..." : "Gerar Token JWT"}
              </Button>
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
                <Label className="text-sm font-medium text-green-700">Access Token</Label>
                <div className="mt-1 p-3 bg-white border border-green-200 rounded-md">
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
