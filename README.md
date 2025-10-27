# TopCell - E-commerce Platform

Uma plataforma de e-commerce moderna e totalmente responsiva para uma loja de eletrônicos, desenvolvida com Next.js 14 e React.

## 🚀 Tecnologias

- **Next.js 14** - Framework React para produção
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **React Icons** - Ícones modernos
- **Context API** - Gerenciamento de estado do carrinho

## 📦 Funcionalidades

### Páginas Implementadas

- **Home Page** (`/`) - Página inicial com seções hero, categorias e produtos em destaque
- **Produtos** (`/products`) - Listagem completa de produtos com filtros e ordenação
- **Detalhes do Produto** (`/products/[id]`) - Página de detalhes com especificações e galeria de imagens
- **Carrinho** (`/cart`) - Gerenciamento de itens do carrinho com ajuste de quantidade
- **Checkout** (`/checkout`) - Processo de checkout em 3 etapas (Envio, Pagamento, Revisão)

### Componentes

- **Header** - Navegação responsiva com menu mobile
- **Footer** - Rodapé com links e redes sociais
- **ProductCard** - Card de produto reutilizável
- **Layout** - Layout principal com Header e Footer
- **Cart Context** - Gerenciamento global do carrinho

### Características

✅ Design totalmente responsivo  
✅ Interface moderna e intuitiva  
✅ Carrinho de compras funcional  
✅ Sistema de categorias (Smartphones, Notebooks, Acessórios, Tablets)  
✅ Filtros e ordenação de produtos  
✅ Galeria de imagens nos detalhes  
✅ Processo de checkout em etapas  
✅ Validação de formulários  

## 🛠️ Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra [http://localhost:3000](http://localhost:3000) no navegador

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter

## 🎨 Estrutura do Projeto

```
topcell-ecommerce/
├── app/                    # App Router do Next.js
│   ├── layout.tsx         # Layout raiz
│   ├── page.tsx           # Home page
│   ├── products/          # Páginas de produtos
│   ├── cart/              # Página do carrinho
│   └── checkout/          # Página de checkout
├── components/             # Componentes React
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── ProductCard.tsx
├── context/               # Context API
│   └── CartContext.tsx
├── lib/                   # Utilitários
│   └── products.ts        # Dados mock dos produtos
└── public/                # Arquivos estáticos
```

## 🛍️ Produtos Incluídos

A loja inclui uma variedade de produtos de eletrônicos:
- Smartphones (iPhone, Samsung, Xiaomi, etc.)
- Notebooks (MacBook, Dell, HP, ASUS, etc.)
- Acessórios (AirPods, Fones, Mouse, etc.)
- Tablets (iPad Pro, Galaxy Tab, etc.)

## 🎯 Próximos Passos

- [ ] Integração com backend/API
- [ ] Sistema de autenticação
- [ ] Área do cliente
- [ ] Sistema de avaliações
- [ ] Wishlist (Lista de desejos)
- [ ] Integração com gateway de pagamento
- [ ] SEO otimizado
- [ ] Testes automatizados

## 📄 Licença

Este projeto é open source e está disponível sob a licença MIT.

