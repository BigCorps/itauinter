# Token Bancário

Sistema completo para integração com as APIs dos Bancos Itaú e Inter, desenvolvido com Encore.ts e React.

## Arquitetura

### Frontend (Vercel)
- **React + TypeScript + Vite**
- **Tailwind CSS + shadcn/ui**
- **Deploy automático via GitHub**
- **URL**: `https://token-bancario.vercel.app`

### Backend (Railway)
- **Encore.ts + PostgreSQL**
- **Deploy automático via GitHub**
- **Escalabilidade automática**
- **URL**: `https://token-bancario-production.up.railway.app`

### Repositório (GitHub)
- **Controle de versão**
- **CI/CD automático**
- **Webhooks para deploy**

## Funcionalidades

### 🔐 Autenticação
- **Client Credentials Flow**: Autenticação padrão com client_id e client_secret
- **JWT + mTLS Flow**: Autenticação avançada com JWT para maior segurança
- **Renovação Automática**: Tokens são renovados automaticamente a cada 5 minutos
- **Pool de Tokens**: Sistema inteligente de pool de tokens para alta demanda
- **Cache Distribuído**: Tokens são compartilhados entre múltiplas instâncias
- **Armazenamento Seguro**: Credenciais e certificados são armazenados de forma segura
- **Upload de Arquivos**: Suporte para upload de certificados e chaves privadas
- **Conversão Base64**: Conversão automática para Base64
- **Suporte Multi-Banco**: Itaú e Inter com suas respectivas especificações

### 💳 PIX
- **Pagamentos PIX**: Envie pagamentos para qualquer chave PIX
- **Recebimentos PIX**: Gere QR Codes para receber pagamentos
- **Consulta de Status**: Verifique o status de transações PIX em tempo real
- **Suporte a Todos os Tipos de Chave**: CPF, CNPJ, E-mail, Telefone e Chave Aleatória

### 🧾 Boletos
- **Emissão de Boletos**: Crie boletos bancários com todos os dados necessários
- **Consulta de Status**: Verifique se boletos foram pagos ou estão vencidos
- **Dados Completos do Pagador**: Inclui endereço completo e informações fiscais
- **Configurações Avançadas**: Multa, juros e instruções personalizadas

### 🏦 Conta Bancária
- **Consulta de Saldo**: Verifique saldo atual e disponível
- **Extrato Detalhado**: Obtenha histórico de transações por período
- **Múltiplas Contas**: Suporte a diferentes agências e contas

### 🔔 Webhooks
- **Notificações em Tempo Real**: Receba eventos dos bancos automaticamente
- **Histórico Completo**: Visualize todas as notificações recebidas
- **Filtros Avançados**: Filtre por tipo de evento e período
- **Processamento Automático**: Eventos são processados e armazenados automaticamente

### 🤖 Integração Typebot
- **URLs Prontas**: Endpoints formatados para uso direto no Typebot
- **Headers e Bodies**: Exemplos completos de requisições
- **Variáveis Dinâmicas**: Suporte a variáveis do Typebot
- **Documentação Completa**: Guia passo a passo para integração

## Estratégia de Tokens

### Banco Itaú
- **Duração**: 5 minutos (300 segundos)
- **Múltiplos Tokens**: Sim, permite múltiplos tokens simultâneos
- **Pool de Tokens**: Sistema mantém 3-5 tokens válidos por cliente
- **Renovação Proativa**: Tokens são renovados antes de expirar
- **Cache Inteligente**: Distribuição automática de tokens entre requisições

### Banco Inter
- **Duração**: 2 anos
- **Token Único**: Um token por cliente é suficiente
- **Cache Longo**: Token é armazenado e reutilizado por toda sua validade
- **Renovação Automática**: Apenas quando próximo do vencimento

### Otimizações para Alta Demanda

#### Pool de Tokens Itaú
```
Cliente A:
├── Token 1 (válido por 4min 30s)
├── Token 2 (válido por 4min 45s)
├── Token 3 (válido por 3min 20s)
└── Token 4 (sendo gerado)
```

#### Distribuição Inteligente
- **Round Robin**: Tokens são distribuídos em rotação
- **Health Check**: Tokens próximos do vencimento são evitados
- **Fallback**: Se um token falha, outro é usado automaticamente
- **Pré-geração**: Novos tokens são criados antes dos atuais expirarem

## Deploy e Infraestrutura

### Railway (Backend)
```bash
# 1. Conectar repositório GitHub ao Railway
# 2. Configurar variáveis de ambiente
# 3. Deploy automático a cada push

# Variáveis necessárias no Railway:
ENCORE_ENV=production
DATABASE_URL=postgresql://... (gerado automaticamente)
```

### Vercel (Frontend)
```bash
# 1. Conectar repositório GitHub ao Vercel
# 2. Configurar build settings:
# Build Command: npm run build
# Output Directory: dist
# Install Command: npm install

# Variáveis necessárias no Vercel:
VITE_API_URL=https://token-bancario-production.up.railway.app
```

### GitHub (Repositório)
```bash
# Estrutura do repositório:
├── backend/          # Encore.ts services
├── frontend/         # React application
├── .github/
│   └── workflows/    # CI/CD workflows
├── railway.json     # Railway configuration
└── vercel.json      # Vercel configuration
```

## URLs e Endpoints

### Base URLs
- **Frontend**: `https://token-bancario.vercel.app`
- **Backend**: `https://token-bancario-production.up.railway.app`
- **STS Itaú**: `https://sts.itau.com.br`
- **APIs Itaú**: `https://api.itau.com.br`
- **APIs Inter**: `https://cdpj.partners.bancointer.com.br`

### Endpoints do Sistema

#### Autenticação
- `POST /auth/token` - Gerar token com client credentials
- `POST /auth/jwt-token` - Gerar token com JWT
- `GET /auth/token/:clientId` - Consultar token existente
- `POST /auth/refresh/:clientId` - Renovar token
- `GET /auth/pool/:clientId` - Obter token do pool (otimizado)

#### PIX
- `POST /pix/pagamento` - Criar pagamento PIX
- `POST /pix/recebimento` - Gerar QR Code PIX
- `GET /pix/status/:idTransacao` - Consultar status PIX

#### Boletos
- `POST /boleto/criar` - Emitir boleto
- `GET /boleto/status/:nossoNumero` - Consultar status boleto

#### Conta
- `GET /account/saldo` - Consultar saldo
- `GET /account/extrato` - Consultar extrato

#### Webhooks
- `POST /webhook/notification` - Receber notificações (endpoint público)
- `GET /webhook/notifications` - Listar notificações recebidas

## Integração com Typebot

### 1. Gerar Token (Otimizado)

**URL:** `https://token-bancario-production.up.railway.app/auth/pool/{{clientId}}`
**Método:** GET
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```
**Query Parameters:**
- `banco`: ITAU ou INTER

### 2. Criar Pagamento PIX

**URL:** `https://token-bancario-production.up.railway.app/pix/pagamento`
**Método:** POST
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```
**Body:**
```json
{
  "banco": "{{banco}}",
  "clientId": "{{clientId}}",
  "accessToken": "{{accessToken}}",
  "valor": {{valor}},
  "chaveDestinatario": "{{chaveDestinatario}}",
  "tipoChave": "{{tipoChave}}",
  "descricao": "{{descricao}}",
  "nomeDestinatario": "{{nomeDestinatario}}"
}
```

### 3. Gerar QR Code PIX

**URL:** `https://token-bancario-production.up.railway.app/pix/recebimento`
**Método:** POST
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```
**Body:**
```json
{
  "banco": "{{banco}}",
  "clientId": "{{clientId}}",
  "accessToken": "{{accessToken}}",
  "valor": {{valor}},
  "chaveRecebimento": "{{chaveRecebimento}}",
  "tipoChave": "{{tipoChave}}",
  "descricao": "{{descricao}}"
}
```

### 4. Criar Boleto

**URL:** `https://token-bancario-production.up.railway.app/boleto/criar`
**Método:** POST
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```
**Body:**
```json
{
  "banco": "{{banco}}",
  "clientId": "{{clientId}}",
  "accessToken": "{{accessToken}}",
  "valor": {{valor}},
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
}
```

### 5. Consultar Saldo

**URL:** `https://token-bancario-production.up.railway.app/account/saldo`
**Método:** GET
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```
**Body:**
```json
{
  "banco": "{{banco}}",
  "clientId": "{{clientId}}",
  "accessToken": "{{accessToken}}",
  "agencia": "{{agencia}}",
  "conta": "{{conta}}"
}
```

### 6. Consultar Extrato

**URL:** `https://token-bancario-production.up.railway.app/account/extrato`
**Método:** GET
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```
**Query Parameters:**
- `dataInicio`: Data de início (YYYY-MM-DD)
- `dataFim`: Data de fim (YYYY-MM-DD)

**Body:**
```json
{
  "banco": "{{banco}}",
  "clientId": "{{clientId}}",
  "accessToken": "{{accessToken}}",
  "agencia": "{{agencia}}",
  "conta": "{{conta}}"
}
```

### 7. Consultar Status PIX

**URL:** `https://token-bancario-production.up.railway.app/pix/status/{{idTransacao}}`
**Método:** GET
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```
**Body:**
```json
{
  "banco": "{{banco}}",
  "clientId": "{{clientId}}",
  "accessToken": "{{accessToken}}"
}
```

### 8. Consultar Status Boleto

**URL:** `https://token-bancario-production.up.railway.app/boleto/status/{{nossoNumero}}`
**Método:** GET
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```
**Body:**
```json
{
  "banco": "{{banco}}",
  "clientId": "{{clientId}}",
  "accessToken": "{{accessToken}}"
}
```

## Configuração do Webhook

Para receber notificações automáticas dos bancos, configure a seguinte URL no painel do banco:

```
https://token-bancario-production.up.railway.app/webhook/notification
```

### Eventos Suportados
- `PIX_RECEIVED` - PIX recebido
- `PIX_PAYMENT_CONFIRMED` - Pagamento PIX confirmado
- `BOLETO_PAID` - Boleto pago
- `BOLETO_EXPIRED` - Boleto vencido

## Guia de Deploy

### 1. Railway (Backend)

1. **Criar conta no Railway**: https://railway.app
2. **Conectar GitHub**: Autorize o Railway a acessar seu repositório
3. **Criar novo projeto**: 
   - Selecione "Deploy from GitHub repo"
   - Escolha seu repositório
   - Railway detectará automaticamente o Encore.ts
4. **Configurar variáveis**:
   ```
   ENCORE_ENV=production
   ```
5. **Deploy automático**: A cada push no GitHub, o Railway fará deploy automaticamente

### 2. Vercel (Frontend)

1. **Criar conta no Vercel**: https://vercel.com
2. **Conectar GitHub**: Autorize o Vercel a acessar seu repositório
3. **Importar projeto**:
   - Root Directory: `frontend`
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Configurar variáveis**:
   ```
   VITE_API_URL=https://seu-projeto.up.railway.app
   ```
5. **Deploy automático**: A cada push no GitHub, o Vercel fará deploy automaticamente

### 3. Configuração de Domínio (Opcional)

#### Railway
- Acesse o dashboard do Railway
- Vá em Settings > Domains
- Adicione seu domínio personalizado

#### Vercel
- Acesse o dashboard do Vercel
- Vá em Settings > Domains
- Adicione seu domínio personalizado

## Monitoramento e Logs

### Railway
- **Logs em tempo real**: Dashboard do Railway
- **Métricas**: CPU, memória, rede
- **Alertas**: Configuráveis por email/Slack
- **Backup automático**: PostgreSQL

### Vercel
- **Analytics**: Tráfego e performance
- **Logs de build**: Histórico completo
- **Edge Functions**: Monitoramento global

## Segurança

### Certificados
- Todos os certificados são armazenados de forma segura
- Conversão automática para Base64
- Validação de formato e conteúdo

### Tokens
- Pool de tokens para Itaú (alta disponibilidade)
- Cache distribuído para Inter (longa duração)
- Renovação automática e proativa
- Logs de auditoria

### Dados Sensíveis
- Client secrets são mascarados na interface
- Certificados são criptografados no banco
- Logs não contêm informações sensíveis
- HTTPS obrigatório em produção

### Variáveis de Ambiente
- Secrets gerenciados pelo Railway
- Separação entre desenvolvimento e produção
- Rotação automática de credenciais

## Capacidade e Performance

### Railway
- **Escalabilidade**: Automática baseada em demanda
- **CPU**: Até 8 vCPUs por serviço
- **RAM**: Até 32GB por serviço
- **Storage**: SSD de alta performance
- **Database**: PostgreSQL gerenciado

### Tokens Simultâneos
- **Itaú**: 3-5 tokens por cliente no pool
- **Inter**: 1 token por cliente (longa duração)
- **Total**: Suporte a 1000+ clientes simultâneos
- **Renovação**: Automática e não-bloqueante

### Otimizações
- Cache em memória para tokens frequentes
- Pool pré-aquecido para clientes ativos
- Distribuição round-robin de tokens
- Fallback automático em caso de falha
- CDN global via Vercel

## Custos Estimados

### Railway (Backend)
- **Starter**: $5/mês - Ideal para desenvolvimento
- **Pro**: $20/mês - Recomendado para produção
- **PostgreSQL**: Incluído no plano

### Vercel (Frontend)
- **Hobby**: Gratuito - Ideal para projetos pessoais
- **Pro**: $20/mês - Recomendado para produção
- **Bandwidth**: 100GB incluído

### GitHub
- **Gratuito**: Repositórios públicos ilimitados
- **Pro**: $4/mês - Repositórios privados ilimitados

### Total Estimado
- **Desenvolvimento**: $0-9/mês
- **Produção**: $40-50/mês

## Suporte

Para dúvidas ou problemas:
1. Consulte esta documentação
2. Verifique os logs do Railway/Vercel
3. Entre em contato com o suporte técnico

## Licença

Este sistema é proprietário e destinado exclusivamente para integração com as APIs dos Bancos Itaú e Inter.
