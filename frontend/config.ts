// Configuração da API baseada no ambiente
const getApiUrl = () => {
  // Em produção, usar a URL do Railway
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://token-bancario-production.up.railway.app';
  }
  
  // Em desenvolvimento, usar localhost
  return 'http://localhost:4000';
};

// URL base da API
export const API_BASE_URL = getApiUrl();

// Configurações do cliente HTTP
export const HTTP_CONFIG = {
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
};

// URLs dos bancos
export const BANK_URLS = {
  ITAU: {
    STS: 'https://sts.itau.com.br',
    API: 'https://api.itau.com.br',
  },
  INTER: {
    OAUTH: 'https://cdpj.partners.bancointer.com.br/oauth/v2',
    API: 'https://cdpj.partners.bancointer.com.br',
  },
};

// Configurações de token
export const TOKEN_CONFIG = {
  ITAU: {
    EXPIRES_IN: 300, // 5 minutos
    POOL_SIZE: 5,
    RENEWAL_THRESHOLD: 30, // Renovar quando restam 30 segundos
  },
  INTER: {
    EXPIRES_IN: 63072000, // 2 anos
    CACHE_DURATION: 31536000, // 1 ano de cache local
  },
};

// Configurações de ambiente
export const ENV_CONFIG = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  apiUrl: API_BASE_URL,
};
