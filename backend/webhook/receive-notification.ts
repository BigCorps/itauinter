import { api, APIError } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

const webhookDB = new SQLDatabase("webhook", {
  migrations: "./migrations",
});

interface WebhookNotification {
  eventType: string;
  eventId: string;
  timestamp: Date;
  data: Record<string, any>;
  targetId?: string;
}

interface WebhookResponse {
  received: boolean;
  eventId: string;
  timestamp: Date;
}

// Recebe notificações webhook do Itaú
export const receiveNotification = api<WebhookNotification, WebhookResponse>(
  { expose: true, method: "POST", path: "/webhook/notification" },
  async (req) => {
    try {
      // Validar campos obrigatórios
      if (!req.eventType || !req.eventId || !req.data) {
        throw APIError.invalidArgument("Campos obrigatórios: eventType, eventId, data");
      }

      // Salvar a notificação no banco
      await webhookDB.exec`
        INSERT INTO webhook_notifications (
          event_type, event_id, timestamp, data, target_id, created_at
        )
        VALUES (
          ${req.eventType}, ${req.eventId}, ${req.timestamp.toISOString()}, 
          ${JSON.stringify(req.data)}, ${req.targetId || ""}, NOW()
        )
      `;

      // Processar a notificação baseado no tipo de evento
      await processWebhookEvent(req);

      return {
        received: true,
        eventId: req.eventId,
        timestamp: new Date(),
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw APIError.internal(`Erro interno: ${error}`);
    }
  }
);

async function processWebhookEvent(notification: WebhookNotification) {
  switch (notification.eventType) {
    case "PIX_RECEIVED":
      // Processar recebimento de PIX
      console.log("PIX recebido:", notification.data);
      break;
    case "PIX_PAYMENT_CONFIRMED":
      // Processar confirmação de pagamento PIX
      console.log("Pagamento PIX confirmado:", notification.data);
      break;
    case "BOLETO_PAID":
      // Processar pagamento de boleto
      console.log("Boleto pago:", notification.data);
      break;
    case "BOLETO_EXPIRED":
      // Processar vencimento de boleto
      console.log("Boleto vencido:", notification.data);
      break;
    default:
      console.log("Evento não reconhecido:", notification.eventType);
  }
}
