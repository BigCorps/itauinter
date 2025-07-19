import { api, APIError, Query } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

const webhookDB = SQLDatabase.named("webhook");

interface GetNotificationsRequest {
  eventType?: Query<string>;
  limit?: Query<number>;
  offset?: Query<number>;
}

interface NotificationItem {
  id: number;
  eventType: string;
  eventId: string;
  timestamp: Date;
  data: Record<string, any>;
  targetId?: string;
  createdAt: Date;
}

interface NotificationsResponse {
  notifications: NotificationItem[];
  total: number;
}

// Lista as notificações webhook recebidas
export const getNotifications = api<GetNotificationsRequest, NotificationsResponse>(
  { expose: true, method: "GET", path: "/webhook/notifications" },
  async (req) => {
    try {
      const limit = req.limit || 50;
      const offset = req.offset || 0;

      let whereClause = "";
      let params: any[] = [];

      if (req.eventType) {
        whereClause = "WHERE event_type = $1";
        params.push(req.eventType);
      }

      // Buscar notificações
      const notifications = await webhookDB.rawQueryAll<{
        id: number;
        event_type: string;
        event_id: string;
        timestamp: string;
        data: string;
        target_id: string;
        created_at: Date;
      }>(
        `SELECT id, event_type, event_id, timestamp, data, target_id, created_at 
         FROM webhook_notifications 
         ${whereClause}
         ORDER BY created_at DESC 
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        ...params,
        limit,
        offset
      );

      // Contar total
      const countResult = await webhookDB.rawQueryRow<{ count: number }>(
        `SELECT COUNT(*) as count FROM webhook_notifications ${whereClause}`,
        ...params
      );

      return {
        notifications: notifications.map(n => ({
          id: n.id,
          eventType: n.event_type,
          eventId: n.event_id,
          timestamp: new Date(n.timestamp),
          data: JSON.parse(n.data),
          targetId: n.target_id || undefined,
          createdAt: n.created_at,
        })),
        total: countResult?.count || 0,
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw APIError.internal(`Erro interno: ${error}`);
    }
  }
);
