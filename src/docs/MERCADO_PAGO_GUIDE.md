# 🎯 Guia Completo: Integração Mercado Pago Checkout Pro

## 📋 Índice

1. [Resumo da Implementação](#resumo)
2. [Configuração de Ambiente](#configuração)
3. [Cartões de Teste](#cartões-de-teste)
4. [Fluxo de Pagamento](#fluxo)
5. [Testing Sandbox](#testing)
6. [Migração para Produção](#produção)
7. [Troubleshooting](#troubleshooting)

---

## 📊 Resumo da Implementação {#resumo}

### Arquitetura de Arquivos

```
src/
├── app/
│   ├── api/
│   │   ├── create-payment/route.ts          # ✅ POST: Cria preferência MP
│   │   ├── payments/[id]/route.ts           # ✅ GET: Consulta status
│   │   └── webhook/route.ts                 # ✅ POST: Recebe notificações MP
│   └── (public)/(checkout)/
│       ├── success/page.tsx                 # ✅ Página de sucesso
│       ├── failure/page.tsx                 # ✅ Página de erro
│       └── pending/page.tsx                 # ✅ Página pendente
├── components/
│   ├── atoms/MercadoPagoButton/index.tsx   # ✅ Botão de pagamento
│   └── forms/MercadoPagoCheckoutForm.tsx   # ✅ Formulário checkout
└── lib/
    └── mercadopago.ts                       # ✅ Utilitários e logger
```

### Fluxo Completo

```
┌─ Frontend ─────────────────────┬─ Backend ──────────────────────┬─ Mercado Pago ───────┐
│                                 │                                 │                      │
│ 1. Usuário clica               │                                 │                      │
│    "Pagar com MP"              │                                 │                      │
│         ↓                       │                                 │                      │
│ 2. Envia dados do carrinho     →→ POST /api/create-payment      │                      │
│                                 │          ↓                     │                      │
│                                 │ Valida dados                   │                      │
│                                 │ Envia para MP                 →→ Cria preferência    │
│                                 │          ↓                     │         ↓            │
│ 3. Recebe init_point ←←────────┤ Retorna init_point ←←────────┤ Retorna URL checkout │
│                                 │                                 │                      │
│ 4. Redireciona para MP         →→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→ Checkout Pro        │
│    (browser)                    │                                 │       ↓             │
│         ↓                       │                                 │  Usuário paga       │
│ 5. Usuário paga                │                                 │       ↓             │
│         ↓                       │                                 │                      │
│ 6. MP redireciona para         │                                 │                      │
│    success/failure/pending     │   ← POST /api/webhook ←←←────  Envia notificação    │
│         ↓                       │           ↓                     │                      │
│ 7. Mostra status               │    Valida & atualiza DB        │                      │
│                                 │                                 │                      │
└─────────────────────────────────┴─────────────────────────────────┴──────────────────────┘
```

---

## 🔐 Configuração de Ambiente {#configuração}

### `.env.local` - SANDBOX (Desenvolvimento)

```bash
# ===== MERCADO PAGO - SANDBOX (NÃO USE EM PRODUÇÃO) =====
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-926607722500117-033021-...
MERCADO_PAGO_PUBLIC_KEY=APP_USR-bfa41cf3-c51a-4c65-86b9-...

# URLs de retorno
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000

# Webhook (opcional em sandbox)
MERCADO_PAGO_WEBHOOK_SECRET=seu_webhook_secret_aqui
```

### Obter Credenciais (Sandbox)

1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Faça login com sua conta
3. Vá para **Credenciais > Teste**
4. Copie `Access Token` e `Public Key`
5. Cole no `.env.local`

---

## 💳 Cartões de Teste {#cartões-de-teste}

### Ambiente SANDBOX - Cartões Oficiais

#### ✅ Pagamento APROVADO

```
Número:      4111 1111 1111 1111
Vencimento:  11/25 (mês/ano)
CVV:         123
Titular:     APRO
```

#### ❌ Pagamento REJEITADO

```
Número:      4002 1440 8020 8003
Vencimento:  11/25
CVV:         123
Titular:     OOPS
```

#### ⏳ Pagamento PENDENTE

```
Número:      4009 1234 5678 9010
Vencimento:  11/25
CVV:         123
Titular:     CONT
```

#### 🔒 Pagamento com 3DS (Autenticação Extra)

```
Número:      4918 9129 5274 0010
Vencimento:  11/25
CVV:         123
Titular:     3D
```

### Email de Teste (Comprador)

```
Email: test_user_12345@testuser.com
Senha: cualquier
```

---

## 🧪 Testing Sandbox - Passo a Passo {#testing}

### Teste 1: Pagamento Aprovado

```bash
# 1. Iniciar servidor
pnpm dev

# 2. Ir para página de produtos
# http://localhost:3000/products

# 3. Adicionar produtos ao carrinho

# 4. Clicar no botão "Pagar com Mercado Pago"

# 5. Preencher formulário:
#    - Nome: João Silva
#    - Email: seu@email.com
#    - Telefone: (opcional)

# 6. Clicar "Pagar com Mercado Pago"

# 7. Será redirecionado para MP
#    - Inserir cartão: 4111 1111 1111 1111
#    - Data: 11/25
#    - CVV: 123
#    - Titular: APRO

# 8. Clicar "Pagar"

# 9. Será redirecionado para /success

# 10. Verificar logs no console
```

### Teste 2: Consultar Status de Pagamento

```bash
# Após pagar, pegar o payment_id da URL success
# Exemplo: https://localhost:3000/success?payment_id=12345678

# Fazer requisição:
curl http://localhost:3000/api/payments/12345678
```

**Resposta esperada:**

```json
{
  "success": true,
  "payment": {
    "id": "12345678",
    "status": "approved",
    "transaction_amount": 99.9,
    "currency_id": "BRL",
    "created_at": "2024-03-30T10:30:00Z",
    "last_updated": "2024-03-30T10:35:00Z"
  }
}
```

### Teste 3: Simular Webhook

```bash
# Simular notificação do Mercado Pago
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -H "x-request-id: 12345" \
  -d '{
    "id": "123456789",
    "live_mode": false,
    "type": "payment",
    "data": {
      "id": 12345678
    },
    "created_at": "2024-03-30T10:35:00Z"
  }'
```

**Resposta esperada:**

```json
{
  "received": true,
  "payment_id": "12345678",
  "status": "approved",
  "request_id": "12345"
}
```

### Teste 4: Verificar Logs

```bash
# Terminal 1: Rodar aplicação
pnpm dev

# Terminal 2: Seguir logs em tempo real
tail -f .next/logs/mercadopago.log
```

Você verá logs como:

```
[2024-03-30T10:30:00Z] [INFO] [CREATE_PAYMENT] Preferência criada com sucesso
[2024-03-30T10:32:00Z] [INFO] [GET_PAYMENT] Status obtido com sucesso
[2024-03-30T10:35:00Z] [INFO] [WEBHOOK] Notificação processada com sucesso
```

---

## 🚀 Migração para Produção {#produção}

### Checklist Pré-Produção

- [ ] Código revisado e testado em sandbox
- [ ] Todas as variáveis de ambiente configuradas
- [ ] HTTPS ativado em produção
- [ ] Logs centralizados (Datadog, Sentry, etc.)
- [ ] Backup do banco de dados configurado
- [ ] Plano de rollback preparado

### 1. Obter Credenciais de Produção

```bash
# 1. Acessar: https://www.mercadopago.com.br/developers/panel
# 2. Ir em: Credenciais > Produção
# 3. Copiar Access Token e Public Key
```

### 2. Atualizar `.env.production`

```bash
# ===== MERCADO PAGO - PRODUÇÃO =====
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-prod-token-...
MERCADO_PAGO_PUBLIC_KEY=APP_USR-prod-key-...

# URLs de retorno (atualizar para domínio real)
NEXT_PUBLIC_BASE_URL=https://docesbibi.com.br
NEXT_PUBLIC_API_URL=https://docesbibi.com.br

# Webhook
MERCADO_PAGO_WEBHOOK_SECRET=seu_webhook_secret_seguro
```

### 3. Registrar Webhooks em Produção

1. Acessar: https://www.mercadopago.com.br/developers/panel/webhooks
2. Clicar "Adicionar nova notificação"
3. URL: `https://seu-dominio.com/api/webhook`
4. Eventos: Selecionar "payment"
5. Verificação: Salvar e testar

### 4. Testar em Produção

```bash
# Usar cartões reais (com consentimento do cliente)
# OU pedir para Mercado Pago habilitar "Enhanced Testing Mode"

# Após 1º pagamento real:
# 1. Verificar que order foi criada no DB
# 2. Confirmar que webhook foi recebido
# 3. Testar página de sucesso
# 4. Validar e-mail de confirmação
```

### 5. Deploy

```bash
# Build
pnpm build

# Deploy (Vercel, AWS, etc)
pnpm start

# Verificar health check
curl https://seu-dominio.com/api/webhook
```

---

## 🐛 Troubleshooting {#troubleshooting}

### Problema: "Access Token inválido"

**Solução:**

1. Verificar se token foi copiado corretamente
2. Não há espaços em branco
3. Token corresponde ao ambiente correto (sandbox vs produção)
4. Token ainda está válido (expiram após 6 meses)

### Problema: "Webhook não está recebendo notificações"

**Solução:**

1. Confirmar webhook está registrado em painel MP
2. URL pública é acessível
3. HTTPS em produção
4. Verificar firewall/security groups
5. Testar com `curl` manualmente

### Problema: "External reference não é único"

**Solução:**

```javascript
// ❌ Errado: Pode gerar IDs duplicados
external_reference: `ORDER_${Date.now()}`;

// ✅ Correto: Use UUID
import { v4 as uuidv4 } from "uuid";
external_reference: `ORDER_${uuidv4()}`;
```

### Problema: "Payment recusado sem motivo"

**Solução:**

1. Verificar resposta de erro em JSON
2. Consultar API do MP: `GET /v1/payments/{id}`
3. Verificar se payer.email é válido
4. Cartão não bloqueado no banco

### Problema: "Status não atualiza"

**Solução:**

1. Verificar que webhook está sendo acionado
2. Confirmar query na atualização de orders
3. Verificar permissões de acesso ao banco
4. Ver logs para erros de conexão

---

## 📞 Suporte

- **Documentação Oficial** https://developer.mercadopago.com.br
- **Status da API** https://status.mercadopago.com/
- **Forum** https://community.mercadopago.com/
- **Email** developers@mercadopago.com

---

## ✅ Checklists Finais

### Desenvolvimento ✓

- [x] FASE 1: Configuração (SDK instalado, variáveis de env)
- [x] FASE 2: Endpoint criar preferência (POST /api/create-payment)
- [x] FASE 2: Endpoint consultar payment (GET /api/payments/{id})
- [x] FASE 3: Componente MercadoPagoButton
- [x] FASE 3: Páginas success/failure/pending
- [x] FASE 4: Webhook (POST /api/webhook)
- [x] FASE 4: Logging estruturado
- [ ] FASE 5: Testes em sandbox (PRÓXIMO PASSO)

### Produção

- [ ] Credenciais de produção obtidas
- [ ] Variáveis de env atualizadas
- [ ] Webhooks registrados no painel MP
- [ ] HTTPS configurado
- [ ] Testes em produção com cartões reais
- [ ] Monitoramento/Alertas configurados
- [ ] Documentação da equipe atualizada

---

**Última atualização:** 30/03/2024  
**Versão:** 1.0.0  
**Status:** ✅ Pronto para Sandbox Testing
