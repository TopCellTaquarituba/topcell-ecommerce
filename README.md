# TopCell e‑commerce

E‑commerce completo com Next.js (App Router), pagamentos Mercado Pago (Bricks + Webhook), admin básico, integração com Bling (ERP) e suporte opcional a Shopify Storefront. Inclui favoritos por usuário, páginas institucionais e painel de vendas.

## Stack Principal
- Next.js 14, React 18, TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL (Neon/Vercel Postgres/locais)
- Mercado Pago Node SDK (Pix, Cartão, Boleto)
- Nodemailer (e‑mails transacionais)
- React Icons

Integrações opcionais
- Bling API v3 (produtos/pedidos)
- Shopify Storefront API (headless POC)

## Requisitos
- Node.js 18+
- Banco PostgreSQL

## Configuração
1) Instale as dependências
```
npm install
```

2) Crie `.env.local` com as variáveis relevantes

Banco/Prisma
```
DATABASE_URL=postgresql://USER:PASS@HOST:5432/DB?schema=public
JWT_SECRET=defina-um-segredo
```

Mercado Pago
```
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-...
MP_ACCESS_TOKEN=APP_USR-...
# Webhook público (produção). Evite localhost.
MP_NOTIFICATION_URL=https://seu-dominio
MP_WEBHOOK_SECRET=um-segredo-opcional
BASE_URL=https://seu-dominio
```

E‑mail/Contato
```
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
FROM_EMAIL=loja@dominio.com
NEXT_PUBLIC_STORE_EMAIL=contato@dominio.com
NEXT_PUBLIC_STORE_PHONE="11 99999-9999"
NEXT_PUBLIC_WHATSAPP_NUMBER="11 99999-9999"
NEXT_PUBLIC_WHATSAPP_MESSAGE="Olá! Vim pelo site."
NEXT_PUBLIC_INSTAGRAM=seuperfil
NEXT_PUBLIC_STORE_ADDRESS="Cidade - UF"
```

Integrações (opcionais)
```
# Bling
BLING_CLIENT_ID=...
BLING_CLIENT_SECRET=...
BLING_REDIRECT_URI=https://seu-dominio/api/bling/oauth/callback

# Shopify Storefront
SHOPIFY_STORE_DOMAIN=...
SHOPIFY_STOREFRONT_ACCESS_TOKEN=...
SHOPIFY_API_VERSION=2024-07
```

3) Migre o banco e gere o client Prisma
```
npx prisma migrate dev -n init
# produção: npx prisma migrate deploy
```

4) Rodar em desenvolvimento
```
npm run dev
```

## Funcionalidades
- Catálogo com filtros; categorias dinâmicas (imagem/descrição) usadas no carrossel
- Página de produto com galeria, especificações, favoritos e “avise‑me quando chegar”
- Carrinho e Checkout (Endereço → Revisão → pagamento na tela Bricks)
- Mercado Pago: criação de pagamentos com idempotência + Webhook para atualização de pedido
- Admin: dashboard, vendas, produtos, categorias, integrações (Bling)
- Páginas institucionais: Contato, Envio e Devolução, FAQ
- Favoritos por usuário (isolado por conta, com migração do legato)

## Pagamentos (Mercado Pago)
- Frontend: `/checkout/pay` usa `NEXT_PUBLIC_MP_PUBLIC_KEY`
- Backend: `POST /api/mp/pay` cria o pagamento com `MP_ACCESS_TOKEN`
- Webhook: `POST /api/mp/webhook` (opcionalmente com validação de assinatura `MP_WEBHOOK_SECRET`)
- Em dev, o `notification_url` só é enviado se for público (evita erro de URL inválida)

## Endpoints principais
- `GET/POST /api/products`, `GET/PUT/DELETE /api/products/[id]`
- `GET/POST /api/orders`, `GET/PUT /api/orders/[id]`
- `POST /api/mp/pay`, `POST/GET /api/mp/webhook`
- `GET/POST /api/categories` (name, slug, image, description)
- `POST /api/bling/products/pull` (importação do ERP)

## Scripts
- `npm run dev` – desenvolvimento
- `npm run build` – build de produção
- `npm start` – serve o build
- `npm run lint` – ESLint
- `npx prisma studio` – console do Prisma

## Dicas & Troubleshooting
- Após alterar o schema: `npx prisma migrate dev` e reinicie o servidor
- “Unknown argument 'image'” em categorias → migre o banco (o schema foi expandido)
- “notification_url must be url valid” → defina `MP_NOTIFICATION_URL` com HTTPS
- “Unauthorized use of live credentials (7)” → não misture TEST e APP_USR, habilite produção na conta do MP

## Licença
MIT

