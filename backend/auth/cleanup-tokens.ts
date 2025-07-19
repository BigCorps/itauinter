import { api } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

const authDB = SQLDatabase.named("auth");

interface CleanupResponse {
  itauTokensRemoved: number;
  interTokensRemoved: number;
  jwtTokensRemoved: number;
  poolsUpdated: number;
}

// Limpa tokens expirados e otimiza pools
export const cleanupTokens = api<void, CleanupResponse>(
  { expose: false, method: "POST", path: "/auth/cleanup" },
  async () => {
    try {
      // Marcar tokens Itaú expirados como inativos
      const itauCleanup = await authDB.queryRow<{ count: number }>`
        UPDATE tokens 
        SET is_active = FALSE 
        WHERE banco = 'ITAU' 
        AND is_active = TRUE 
        AND (EXTRACT(EPOCH FROM (NOW() - generated_at)) >= expires_in)
        RETURNING (SELECT COUNT(*) FROM tokens WHERE banco = 'ITAU' AND is_active = FALSE) as count
      `;

      // Marcar tokens Inter expirados como inativos (2 anos)
      const interCleanup = await authDB.queryRow<{ count: number }>`
        UPDATE tokens 
        SET is_active = FALSE 
        WHERE banco = 'INTER' 
        AND is_active = TRUE 
        AND (EXTRACT(EPOCH FROM (NOW() - generated_at)) >= expires_in)
        RETURNING (SELECT COUNT(*) FROM tokens WHERE banco = 'INTER' AND is_active = FALSE) as count
      `;

      // Marcar tokens JWT expirados como inativos
      const jwtCleanup = await authDB.queryRow<{ count: number }>`
        UPDATE jwt_tokens 
        SET is_active = FALSE 
        WHERE is_active = TRUE 
        AND (EXTRACT(EPOCH FROM (NOW() - generated_at)) >= expires_in)
        RETURNING (SELECT COUNT(*) FROM jwt_tokens WHERE is_active = FALSE) as count
      `;

      // Atualizar timestamp de limpeza dos pools
      const poolsUpdate = await authDB.queryRow<{ count: number }>`
        UPDATE token_pools 
        SET last_cleanup_at = NOW(), updated_at = NOW()
        RETURNING (SELECT COUNT(*) FROM token_pools) as count
      `;

      // Remover tokens muito antigos (mais de 1 dia inativos)
      await authDB.exec`
        DELETE FROM tokens 
        WHERE is_active = FALSE 
        AND generated_at < NOW() - INTERVAL '1 day'
      `;

      await authDB.exec`
        DELETE FROM jwt_tokens 
        WHERE is_active = FALSE 
        AND generated_at < NOW() - INTERVAL '1 day'
      `;

      return {
        itauTokensRemoved: itauCleanup?.count || 0,
        interTokensRemoved: interCleanup?.count || 0,
        jwtTokensRemoved: jwtCleanup?.count || 0,
        poolsUpdated: poolsUpdate?.count || 0,
      };
    } catch (error) {
      console.error("Erro na limpeza de tokens:", error);
      return {
        itauTokensRemoved: 0,
        interTokensRemoved: 0,
        jwtTokensRemoved: 0,
        poolsUpdated: 0,
      };
    }
  }
);
