CREATE TABLE webhook_notifications (
  id BIGSERIAL PRIMARY KEY,
  banco TEXT NOT NULL DEFAULT 'ITAU',
  event_type TEXT NOT NULL,
  event_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  data JSONB NOT NULL,
  target_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_webhook_notifications_banco ON webhook_notifications(banco);
CREATE INDEX idx_webhook_notifications_event_type ON webhook_notifications(event_type);
CREATE INDEX idx_webhook_notifications_event_id ON webhook_notifications(event_id);
CREATE INDEX idx_webhook_notifications_created_at ON webhook_notifications(created_at);
CREATE INDEX idx_webhook_notifications_target_id ON webhook_notifications(target_id);
