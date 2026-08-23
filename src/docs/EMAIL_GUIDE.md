# E-mails transacionais (Resend)

Dois e-mails automáticos, disparados por [src/lib/email.ts](../lib/email.ts)
via [Resend](https://resend.com):

1. **Confirmação para o cliente** (`sendOrderConfirmationEmail`) — "recebemos
   seu pedido", com a lista de itens e o total.
2. **Aviso para a gestora** (`sendNewOrderNotificationEmail`) — detalhes
   completos do pedido (cliente, contato, endereço, itens), enviado para
   `STORE_OWNER_EMAIL` — **nunca** para um e-mail vindo do cliente/frontend.

Nenhuma das duas funções lança exceção — uma falha de envio só é logada
(`console.error`), nunca derruba o fluxo de pedido/pagamento que a chamou.
Sem `RESEND_API_KEY` configurada, ambas viram no-op com um aviso no log —
útil pra rodar localmente sem conta no Resend.

## Quando o e-mail é disparado

Propositalmente **não** é disparado na criação do pedido em si — é
disparado no momento em que o pedido reflete uma compra de fato:

- **Checkout com Mercado Pago**: [src/app/api/webhook/route.ts](../app/api/webhook/route.ts)
  dispara os dois e-mails quando o webhook confirma `status === "pago"`.
  Um pedido criado em `aguardando_pagamento` (no `/api/create-payment`) não
  gera e-mail até o pagamento ser aprovado — pagamento recusado/pendente
  nunca dispara.
- **Pedido manual (sem pagamento online)**: [src/app/api/orders/route.ts](../app/api/orders/route.ts)
  (`POST`) dispara os dois e-mails na hora, já que não existe um evento de
  "pagamento confirmado" pra esperar nesse caminho.

## Bug corrigido junto: idempotência do webhook por status

Enquanto cabeava isso, achei que a idempotência do webhook
(`isPaymentEventProcessed`) checava só por `mp_payment_id`. Isso é um
problema real: o Mercado Pago manda **uma notificação por mudança de
status** do mesmo pagamento — ex., Pix/boleto/3DS passam por `pending`
antes de `approved`, cada um como uma notificação HTTP separada, mesmo
`data.id`. Com a chave de idempotência antiga, a primeira notificação
(`pending`) "trava" aquele `mp_payment_id` no banco, e a notificação
seguinte (`approved`, a que de fato importa) era descartada como
"já processado" — o pedido ficava preso em `aguardando_pagamento` para
sempre, e o e-mail nunca disparava.

Corrigido trocando a chave de idempotência para `(mp_payment_id, status)` —
ver [sql/005_payment_events_status_key.sql](../../sql/005_payment_events_status_key.sql),
que precisa ser rodado contra o banco (`psql $DATABASE_URL -f sql/005_payment_events_status_key.sql`)
depois dos arquivos anteriores.

## Configuração

Variáveis (ver [.env.example](../../.env.example)):

```
RESEND_API_KEY=            # https://resend.com/api-keys
EMAIL_FROM=Doces Bibi <onboarding@resend.dev>
STORE_OWNER_EMAIL=docesbibii@gmail.com
```

**`onboarding@resend.dev` só funciona em teste** — o Resend restringe esse
remetente a entregar só para o e-mail cadastrado na sua própria conta
Resend. Para enviar de verdade para clientes (qualquer destinatário):

1. [Verificar um domínio](https://resend.com/domains) no painel do Resend
   (adiciona registros DNS — SPF/DKIM — no domínio real da loja).
2. Trocar `EMAIL_FROM` para um endereço nesse domínio, ex.:
   `Doces Bibi <pedidos@docesbibi.com.br>`.

Sem isso, os e-mails para a gestora ainda funcionam em teste (ela é a dona
da conta Resend), mas os e-mails para clientes reais vão falhar
silenciosamente (erro só no log do servidor).

## Personalização do template

O HTML dos e-mails é montado em `src/lib/email.ts` (funções `emailShell`
e `orderItemsTable`) — strings de template simples, sem dependência de
`react-email`. Cor/fonte seguem a identidade visual já usada nas páginas de
checkout (`rosa-800`/serif).
