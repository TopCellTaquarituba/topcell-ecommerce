## Integração Postgres + Bling ERP

Guia rápido para configurar banco de dados PostgreSQL e integração com o Bling ERP (API v3) neste projeto.

### 1) Variáveis de ambiente

Copie `.env.example` para `.env` e configure:

- `DATABASE_URL` — URL do Postgres
- `BLING_API_TOKEN` — token de acesso da API v3 do Bling
- `BLING_WEBHOOK_SECRET` (opcional) — segredo simples para validar webhooks

### 2) Dependências e migrações

Instale as dependências do Prisma e gere o cliente:

```
npm install prisma @prisma/client
npm run prisma:generate
npm run prisma:migrate
```

O schema está em `prisma/schema.prisma` e define:

- Category, Brand, Product (com `externalId` opcional do Bling), Review
- Customer, Order, OrderItem
- InventoryMovement, SyncLog

### 3) Endpoints de API

- Webhook do Bling: `POST /api/bling/webhook`
  - Configure essa URL no painel do Bling; se usar `BLING_WEBHOOK_SECRET`, informe o mesmo no cabeçalho `x-bling-secret`.
  - O handler atual apenas registra o evento. Expanda para persistir no Postgres (Prisma).

- Sincronização manual: `POST /api/bling/sync`
  - Requer `BLING_API_TOKEN` e `DATABASE_URL` configurados.
  - Faz requisições de exemplo ao Bling. Expanda para fazer upsert no banco.

### 4) Cliente Bling

Arquivo `lib/bling.ts` com helpers mínimos (`blingGet`, `blingPost`, `fetchBlingProducts`, `fetchBlingOrders`, `updateBlingStock`).

### 5) Próximos passos sugeridos

- Implementar mapeamento e upsert de produtos/pedidos no banco via Prisma.
- Adicionar validação/HMAC de webhook se disponível no seu plano do Bling.
- Criar jobs de sincronização incremental por `updatedFrom` (timestamp) para manter estoque/pedidos alinhados.

