# Token Bancário

Sistema completo para integração com as APIs dos Bancos Itaú e Inter, desenvolvido com Encore.ts e React.

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

## URLs e Endpoints

### Base URLs
- **Produção**: `https://token.bigcorps.com.br`
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

**URL:** `https://token.bigcorps.com.br/auth/pool/{{clientId}}`
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

**URL:** `https://token.bigcorps.com.br/pix/pagamento`
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

**URL:** `https://token.bigcorps.com.br/pix/recebimento`
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

**URL:** `https://token.bigcorps.com.br/boleto/criar`
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

**URL:** `https://token.bigcorps.com.br/account/saldo`
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

**URL:** `https://token.bigcorps.com.br/account/extrato`
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

**URL:** `https://token.bigcorps.com.br/pix/status/{{idTransacao}}`
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

**URL:** `https://token.bigcorps.com.br/boleto/status/{{nossoNumero}}`
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

## Observações Importantes para Typebot

### Variáveis
- Substitua `{{variavel}}` pelos valores reais ou variáveis do Typebot
- Use variáveis do Typebot para capturar dados do usuário
- Para alta demanda, use o endpoint `/auth/pool/{{clientId}}` para obter tokens otimizados

### Bancos Suportados
- `ITAU` - Banco Itaú (tokens de 5 minutos com pool)
- `INTER` - Banco Inter (tokens de 2 anos)

### Certificados
- O certificado e chave privada devem estar em formato **Base64**
- Use um conversor online ou comando: `base64 -i arquivo.crt`
- Armazene os certificados em variáveis seguras do Typebot

### Tipos de Chave PIX
- `CPF` - CPF do usuário
- `CNPJ` - CNPJ da empresa
- `EMAIL` - E-mail cadastrado
- `TELEFONE` - Telefone cadastrado
- `CHAVE_ALEATORIA` - Chave aleatória gerada pelo banco

### Respostas
- Todos os endpoints retornam JSON
- Use o campo `accessToken` da resposta de autenticação
- Para Itaú: Token expira em 5 minutos, use pool para alta demanda
- Para Inter: Token expira em 2 anos, pode ser reutilizado

### Tratamento de Erros
- Verifique o status HTTP da resposta
- Trate erros 400 (dados inválidos) e 500 (erro interno)
- Implemente retry para falhas temporárias
- Para Itaú: Se um token falha, tente outro do pool

### Otimizações para Alta Demanda

#### Para Clientes com Muitas Transações
1. **Use o endpoint de pool**: `/auth/pool/{{clientId}}`
2. **Cache tokens localmente** por 4 minutos (Itaú) ou 1 ano (Inter)
3. **Implemente retry** com diferentes tokens do pool
4. **Monitore expiração** e renove proativamente

#### Exemplo de Implementação no Typebot
```javascript
// Para Itaú - Alta demanda
const getItauToken = async (clientId) => {
  try {
    const response = await fetch(`/auth/pool/${clientId}?banco=ITAU`);
    const data = await response.json();
    return data.accessToken;
  } catch (error) {
    // Fallback para geração manual
    return await generateNewToken(clientId);
  }
};

// Para Inter - Token longo
const getInterToken = async (clientId) => {
  // Verificar cache local primeiro
  const cachedToken = localStorage.getItem(`inter_token_${clientId}`);
  if (cachedToken && !isExpired(cachedToken)) {
    return cachedToken;
  }
  
  // Gerar novo token se necessário
  const response = await fetch('/auth/token', { ... });
  const data = await response.json();
  
  // Cache por 1 ano
  localStorage.setItem(`inter_token_${clientId}`, data.accessToken);
  return data.accessToken;
};
```

## Configuração do Webhook

Para receber notificações automáticas dos bancos, configure a seguinte URL no painel do banco:

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

## Capacidade e Performance

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

## Suporte

Para dúvidas ou problemas:
1. Consulte esta documentação
2. Verifique os logs do sistema
3. Entre em contato com o suporte técnico

## Licença

Este sistema é proprietário e destinado exclusivamente para integração com as APIs dos Bancos Itaú e Inter
