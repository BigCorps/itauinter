import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Webhook, RefreshCw, Bell, ExternalLink, Copy } from "lucide-react";
import backend from "~backend/client";

export function WebhookPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    eventType: "",
    limit: "50",
    offset: "0",
  });

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await backend.webhook.getNotifications({
        eventType: filters.eventType || undefined,
        limit: parseInt(filters.limit),
        offset: parseInt(filters.offset),
      });
      setNotifications(response.notifications);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar notificações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case "PIX_RECEIVED":
        return "bg-green-100 text-green-800";
      case "PIX_PAYMENT_CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "BOLETO_PAID":
        return "bg-purple-100 text-purple-800";
      case "BOLETO_EXPIRED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatEventType = (eventType: string) => {
    const types: Record<string, string> = {
      PIX_RECEIVED: "PIX Recebido",
      PIX_PAYMENT_CONFIRMED: "Pagamento PIX Confirmado",
      BOLETO_PAID: "Boleto Pago",
      BOLETO_EXPIRED: "Boleto Vencido",
    };
    return types[eventType] || eventType;
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
          <Webhook className="h-8 w-8 text-red-600" />
          <span>Webhooks</span>
        </h1>
        <p className="text-gray-600">
          Gerencie notificações em tempo real dos bancos
        </p>
      </div>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configuração do Webhook</CardTitle>
              <CardDescription>
                Configure seu endpoint para receber notificações dos bancos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="font-semibold text-blue-800 mb-2">URL do Webhook</h3>
                <code className="text-sm bg-white px-2 py-1 rounded border">
                  https://token.bigcorps.com.br/webhook/notification
                </code>
                <p className="text-sm text-blue-600 mt-2">
                  Configure esta URL no painel dos bancos para receber notificações automáticas.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Eventos Suportados:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• PIX_RECEIVED - PIX recebido</li>
                    <li>• PIX_PAYMENT_CONFIRMED - Pagamento PIX confirmado</li>
                    <li>• BOLETO_PAID - Boleto pago</li>
                    <li>• BOLETO_EXPIRED - Boleto vencido</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Formato da Requisição:</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded">
{`{
  "eventType": "PIX_RECEIVED",
  "eventId": "uuid",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": { ... },
  "targetId": "optional"
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notificações Recebidas</span>
                  </CardTitle>
                  <CardDescription>
                    Histórico de notificações webhook recebidas
                  </CardDescription>
                </div>
                <Button onClick={loadNotifications} disabled={loading} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="eventTypeFilter">Filtrar por Tipo de Evento</Label>
                  <Input
                    id="eventTypeFilter"
                    value={filters.eventType}
                    onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
                    placeholder="Ex: PIX_RECEIVED"
                  />
                </div>
                <div className="w-32">
                  <Label htmlFor="limitFilter">Limite</Label>
                  <Input
                    id="limitFilter"
                    type="number"
                    value={filters.limit}
                    onChange={(e) => setFilters({ ...filters, limit: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={loadNotifications} disabled={loading}>
                    Filtrar
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Carregando notificações...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Webhook className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma notificação encontrada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <Card key={notification.id} className="border-l-4 border-l-red-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Badge className={getEventTypeColor(notification.eventType)}>
                              {formatEventType(notification.eventType)}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              ID: {notification.eventId}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                        </div>
                        
                        {notification.targetId && (
                          <div className="mb-2">
                            <span className="text-sm font-medium">Target ID: </span>
                            <span className="text-sm text-gray-600">{notification.targetId}</span>
                          </div>
                        )}
                        
                        <div className="bg-gray-50 rounded-md p-3">
                          <h4 className="text-sm font-medium mb-2">Dados do Evento:</h4>
                          <pre className="text-xs overflow-auto">
                            {JSON.stringify(notification.data, null, 2)}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ExternalLink className="h-5 w-5" />
                <span>Documentação da API Webhook</span>
              </CardTitle>
              <CardDescription>
                URLs, headers e bodies para integração com APIs de Webhook
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-base md:text-lg font-semibold">1. Receber Notificação (Endpoint Público)</h3>
                <div className="bg-gray-50 p-3 md:p-4 rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-sm">URL:</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("https://token.bigcorps.com.br/webhook/notification")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="block bg-white p-2 rounded border text-xs md:text-sm break-all">
                    https://token.bigcorps.com.br/webhook/notification
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
                        "eventType": "{{eventType}}",
                        "eventId": "{{eventId}}",
                        "timestamp": "{{timestamp}}",
                        "data": "{{data}}",
                        "targetId": "{{targetId}}"
                      }, null, 2))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="block bg-white p-2 rounded border text-xs md:text-sm whitespace-pre overflow-x-auto">
                    {JSON.stringify({
                      "banco": "{{banco}}",
                      "eventType": "{{eventType}}",
                      "eventId": "{{eventId}}",
                      "timestamp": "{{timestamp}}",
                      "data": "{{data}}",
                      "targetId": "{{targetId}}"
                    }, null, 2)}
                  </code>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-base md:text-lg font-semibold">2. Listar Notificações</h3>
                <div className="bg-gray-50 p-3 md:p-4 rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-sm">URL:</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("https://token.bigcorps.com.br/webhook/notifications")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="block bg-white p-2 rounded border text-xs md:text-sm break-all">
                    https://token.bigcorps.com.br/webhook/notifications
                  </code>
                  
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-sm">Método:</Label>
                  </div>
                  <code className="block bg-white p-2 rounded border text-xs md:text-sm">GET</code>
                  
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-sm">Query Parameters (Opcionais):</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("banco={{banco}}&eventType={{eventType}}&limit={{limit}}&offset={{offset}}")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="block bg-white p-2 rounded border text-xs md:text-sm">
                    banco={"{{banco}}"}&eventType={"{{eventType}}"}&limit={"{{limit}}"}&offset={"{{offset}}"}
                  </code>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-md p-3 md:p-4">
                <h4 className="font-semibold text-red-800 mb-2 text-sm md:text-base">Tipos de Evento:</h4>
                <ul className="text-xs md:text-sm text-red-700 space-y-1">
                  <li>• <strong>PIX_RECEIVED</strong> - PIX recebido na conta</li>
                  <li>• <strong>PIX_PAYMENT_CONFIRMED</strong> - Pagamento PIX confirmado</li>
                  <li>• <strong>BOLETO_PAID</strong> - Boleto foi pago</li>
                  <li>• <strong>BOLETO_EXPIRED</strong> - Boleto venceu sem pagamento</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 md:p-4">
                <h4 className="font-semibold text-blue-800 mb-2 text-sm md:text-base">Observações:</h4>
                <ul className="text-xs md:text-sm text-blue-700 space-y-1">
                  <li>• O endpoint de recebimento é público e não requer autenticação</li>
                  <li>• Configure a URL no painel do banco para receber notificações</li>
                  <li>• O timestamp deve estar no formato ISO 8601</li>
                  <li>• O campo data contém informações específicas do evento</li>
                  <li>• targetId é opcional e pode identificar o recurso relacionado</li>
                  <li>• Para listar notificações, todos os parâmetros são opcionais</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
