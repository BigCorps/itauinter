# Sistema de Token Itaú

Sistema completo para integração com as APIs do Banco Itaú, desenvolvido com Encore.ts e React.

## Funcionalidades

### 🔐 Autenticação
- **Client Credentials Flow**: Autenticação padrão com client_id e client_secret
- **JWT + mTLS Flow**: Autenticação avançada com JWT para maior segurança
- **Renovação Automática**: Tokens são renovados automaticamente a cada 5 minutos
- **Armazenamento Seguro**: Credenciais e certificados são armazenados de forma segura

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
- **Notificações em Tempo Real**: Receba eventos do Itaú automaticamente
- **Histórico Completo**: Visualize todas as notificações recebidas
- **Filtros Avançados**: Filtre por tipo de evento e período
- **Processamento Automático**: Eventos são processados e armazenados automaticamente

## URLs e Endpoints

### Base URLs
- **Produção**: `https://token.bigcorps.com.br`
- **STS Itaú**: `https://sts.itau.com.br`
- **APIs Itaú**: `https://api.itau.com.br`

### Endpoints do Sistema

#### Autenticação
- `POST /auth/token` - Gerar token com client credentials
- `POST /auth/jwt-token` - Gerar token com JWT
- `GET /auth/token/:clientId` - Consultar token existente
- `POST /auth/refresh/:clientId` - Renovar token

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

## Exemplos de Uso

### 1. Gerar Token
```bash
curl -X POST https://token.bigcorps.com.br/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "seu_client_id",
    "clientSecret": "seu_client_secret",
    "certificateContent": "-----BEGIN CERTIFICATE-----\n...",
    "privateKeyContent": "-----BEGIN PRIVATE KEY-----\n..."
  }'
```

### 2. Criar Pagamento PIX
```bash
curl -X POST https://token.bigcorps.com.br/pix/pagamento \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "seu_client_id",
    "accessToken": "seu_access_token",
    "valor": 100.50,
    "chaveDestinatario": "usuario@email.com",
    "tipoChave": "EMAIL",
    "descricao": "Pagamento de teste"
  }'
```

### 3. Gerar QR Code PIX
```bash
curl -X POST https://token.bigcorps.com.br/pix/recebimento \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "seu_client_id",
    "accessToken": "seu_access_token",
    "valor": 50.00,
    "chaveRecebimento": "sua_chave@email.com",
    "tipoChave": "EMAIL",
    "descricao": "Cobrança de serviço"
  }'
```

### 4. Emitir Boleto
```bash
curl -X POST https://token.bigcorps.com.br/boleto/criar \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "seu_client_id",
    "accessToken": "seu_access_token",
    "valor": 250.00,
    "vencimento": "2024-12-31",
    "nomePagador": "João Silva",
    "cpfCnpjPagador": "123.456.789-00",
    "enderecoPagador": {
      "logradouro": "Rua das Flores",
      "numero": "123",
      "bairro": "Centro",
      "cidade": "São Paulo",
      "uf": "SP",
      "cep": "01234-567"
    }
  }'
```

### 5. Consultar Saldo
```bash
curl -X GET "https://token.bigcorps.com.br/account/saldo?agencia=1234&conta=56789-0" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "seu_client_id",
    "accessToken": "seu_access_token"
  }'
```

## Configuração do Webhook

Para receber notificações automáticas do Itaú, configure a seguinte URL no painel do banco:

```
https://token.bigcorps.com.br/webhook/notification
```

### Eventos Suportados
- `PIX_RECEIVED` - PIX recebido
- `PIX_PAYMENT_CONFIRMED` - Pagamento PIX confirmado
- `BOLETO_PAID` - Boleto pago
- `BOLETO_EXPIRED` - Boleto vencido

## Segurança

### Certificados
- Todos os certificados são armazenados de forma segura