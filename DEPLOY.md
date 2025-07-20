# Guia de Deploy - Token Bancário

Este guia detalha como fazer o deploy do sistema Token Bancário usando Railway (backend) e Vercel (frontend).

## Pré-requisitos

- Conta no GitHub
- Conta no Railway (https://railway.app)
- Conta no Vercel (https://vercel.com)
- Repositório GitHub com o código

## 1. Deploy do Backend (Railway)

### 1.1 Configuração Inicial

1. **Acesse o Railway**: https://railway.app
2. **Faça login** com sua conta GitHub
3. **Clique em "New Project"**
4. **Selecione "Deploy from GitHub repo"**
5. **Escolha seu repositório** do Token Bancário

### 1.2 Configuração do Projeto

1. **Railway detectará automaticamente** o Encore.ts
2. **Configure as variáveis de ambiente**:
   ```
   ENCORE_ENV=production
   NODE_ENV=production
   ```

### 1.3 Configuração do Build

O Railway usará automaticamente o arquivo `railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend && npm install && encore build",
    "watchPatterns": ["backend/**"]
  },
  "deploy": {
    "startCommand": "cd backend && encore run --env=production",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300
  }
}
```

### 1.4 PostgreSQL

1. **Railway criará automaticamente** um banco PostgreSQL
2. **A variável `DATABASE_URL`** será configurada automaticamente
3. **As migrações** serão executadas automaticamente no primeiro deploy

### 1.5 Deploy

1. **Clique em "Deploy"**
2. **Aguarde o build** (pode levar alguns minutos)
3. **Anote a URL** gerada (ex: `https://token-bancario-production.up.railway.app`)

## 2. Deploy do Frontend (Vercel)

### 2.1 Configuração Inicial

1. **Acesse o Vercel**: https://vercel.com
2. **Faça login** com sua conta GitHub
3. **Clique em "New Project"**
4. **Selecione seu repositório** do Token Bancário

### 2.2 Configuração do Projeto

1. **Configure as seguintes opções**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 2.3 Variáveis de Ambiente

Configure a seguinte variável no Vercel:

```
VITE_API_URL=https://seu-projeto.up.railway.app
```

**Substitua** `seu-projeto.up.railway.app` pela URL real do seu backend no Railway.

### 2.4 Deploy

1. **Clique em "Deploy"**
2. **Aguarde o build** (alguns minutos)
3. **Acesse a URL** gerada (ex: `https://token-bancario.vercel.app`)

## 3. Configuração de CI/CD (Opcional)

### 3.1 GitHub Actions

O arquivo `.github/workflows/deploy.yml` já está configurado para:

- **Executar testes** automaticamente
- **Deploy automático** no Railway e Vercel
- **Executar apenas** quando há push na branch `main`

### 3.2 Secrets do GitHub

Configure os seguintes secrets no GitHub:

**Para Railway:**
```
RAILWAY_TOKEN=seu_token_railway
RAILWAY_PROJECT_ID=seu_project_id
RAILWAY_SERVICE_ID=seu_service_id
```

**Para Vercel:**
```
VERCEL_TOKEN=seu_token_vercel
VERCEL_ORG_ID=seu_org_id
VERCEL_PROJECT_ID=seu_project_id
```

### 3.3 Como obter os tokens

**Railway:**
1. Vá em Settings > Tokens
2. Crie um novo token
3. Copie o Project ID e Service ID do dashboard

**Vercel:**
1. Vá em Settings > Tokens
2. Crie um novo token
3. Copie o Org ID e Project ID do dashboard

## 4. Configuração de Domínio Personalizado (Opcional)

### 4.1 Railway

1. **Acesse o dashboard** do seu projeto
2. **Vá em Settings > Domains**
3. **Clique em "Add Domain"**
4. **Digite seu domínio** (ex: `api.seudominio.com`)
5. **Configure o DNS** conforme instruções

### 4.2 Vercel

1. **Acesse o dashboard** do seu projeto
2. **Vá em Settings > Domains**
3. **Clique em "Add"**
4. **Digite seu domínio** (ex: `seudominio.com`)
5. **Configure o DNS** conforme instruções

## 5. Monitoramento

### 5.1 Railway

- **Logs**: Disponíveis no dashboard em tempo real
- **Métricas**: CPU, memória, rede
- **Alertas**: Configure notificações por email

### 5.2 Vercel

- **Analytics**: Tráfego e performance
- **Logs**: Histórico de builds e deploys
- **Speed Insights**: Performance do frontend

## 6. Backup e Segurança

### 6.1 Backup do Banco

O Railway faz backup automático do PostgreSQL:
- **Backups diários** automáticos
- **Retenção** de 7 dias no plano gratuito
- **Restore** via dashboard

### 6.2 Variáveis Sensíveis

- **Nunca commite** secrets no código
- **Use sempre** variáveis de ambiente
- **Rotacione** tokens periodicamente

## 7. Troubleshooting

### 7.1 Problemas Comuns

**Build falha no Railway:**
- Verifique se o `railway.json` está correto
- Confirme que as dependências estão no `package.json`
- Verifique os logs de build

**Frontend não conecta com backend:**
- Confirme a variável `VITE_API_URL`
- Verifique se o backend está rodando
- Teste a URL do backend diretamente

**Banco de dados não conecta:**
- Verifique se as migrações rodaram
- Confirme a `DATABASE_URL`
- Verifique os logs do Encore.ts

### 7.2 Logs Úteis

**Railway:**
```bash
# Ver logs em tempo real
railway logs

# Ver logs específicos
railway logs --service backend
```

**Vercel:**
```bash
# Ver logs de build
vercel logs

# Ver logs de função
vercel logs --function
```

## 8. Custos Estimados

### 8.1 Railway
- **Starter**: $5/mês (recomendado para produção)
- **Pro**: $20/mês (para alta demanda)
- **PostgreSQL**: Incluído

### 8.2 Vercel
- **Hobby**: Gratuito (projetos pessoais)
- **Pro**: $20/mês (produção)
- **Bandwidth**: 100GB incluído

### 8.3 Total
- **Desenvolvimento**: $0-5/mês
- **Produção**: $25-40/mês

## 9. Próximos Passos

Após o deploy:

1. **Teste todas as funcionalidades**
2. **Configure monitoramento**
3. **Documente as URLs** para a equipe
4. **Configure alertas** de uptime
5. **Implemente backup** adicional se necessário

## 10. Suporte

Para problemas específicos:

- **Railway**: https://docs.railway.app
- **Vercel**: https://vercel.com/docs
- **Encore.ts**: https://encore.dev/docs

---

**Importante**: Substitua todas as URLs de exemplo pelas URLs reais dos seus deploys.
