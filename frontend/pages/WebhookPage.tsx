import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Webhook, RefreshCw, Bell } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center space-x-2">
          <Webhook className="h-8 w-8 text-red-600" />
          <span>Webhooks</span>
        </h1>
        <p className="text-gray-600">
          Gerencie notificações em tempo real do Itaú
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuração do Webhook</CardTitle>
          <CardDescription>
            Configure seu endpoint para receber notificações do Itaú
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-semibold text-blue-800 mb-2">URL do Webhook</h3>
            <code className="text-sm bg-white px-2 py-1 rounded border">
              https://token.bigcorps.com.br/webhook/notification
            </code>
            <p className="text-sm text-blue-600 mt-2">
              Configure esta URL no painel do Itaú para receber notificações automáticas.
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
    </div>
  );
}
