# 🛠️ Painel Administrativo TopCell

## 🔑 Acesso ao Painel Admin

### URL
Acesse: `http://localhost:3000/admin`

### Credenciais de Login
- **Email:** `admin@topcell.com`
- **Senha:** `admin123`

---

## 📊 Funcionalidades Implementadas

### 1. Dashboard (`/admin/dashboard`)
Visão geral com estatísticas de vendas:
- 📈 **Vendas Totais** - Valor total das vendas
- 🛒 **Pedidos** - Quantidade de pedidos realizados
- 👥 **Clientes** - Total de clientes cadastrados
- 💰 **Ticket Médio** - Valor médio por pedido
- 📋 **Pedidos Recentes** - Tabela com últimas vendas

### 2. Analytics (`/admin/analytics`)
Análises detalhadas de vendas:
- 📊 **Vendas por Dia** - Gráfico dos últimos 7 dias
- 🏆 **Produtos Mais Vendidos** - Ranking de top produtos
- 📦 **Vendas por Categoria** - Distribuição por categoria
- ⚡ **Análise de Performance** - Métricas de negócio

### 3. Gerenciamento de Produtos (`/admin/products`)
Gerenciamento completo de produtos:
- ➕ **Adicionar Produtos** - Cadastro de novos produtos
- ✏️ **Editar Produtos** - Modificar informações (UI pronta)
- 🗑️ **Deletar Produtos** - Remover produtos
- 📋 **Listar Produtos** - Visualizar todos os produtos
- 📊 **Controle de Estoque** - Acompanhar quantidade em estoque

---

## 🎨 Características do Painel

### ✅ Responsivo
Funciona perfeitamente em desktop, tablet e mobile

### ✅ Dark Mode
Suporte completo ao tema escuro

### ✅ Animações Suaves
Transições e animações em todas as interações

### ✅ Dados Fictícios
- Vendas simuladas para demonstração
- Pedidos recentes mockados
- Analytics com dados de exemplo

---

## 🔒 Segurança

O painel possui autenticação simples:
- Login com credenciais pré-cadastradas
- Proteção de rotas (redireciona se não autenticado)
- Sessão persistente via localStorage

**Nota:** Em produção, implemente autenticação robusta com JWT e validação server-side.

---

## 📱 Navegação

Após fazer login, você pode navegar entre as páginas:
- **Dashboard** - Página inicial com visão geral
- **Produtos** - Gerenciar catálogo de produtos  
- **Analytics** - Análises e estatísticas detalhadas

Use o menu superior para navegar ou os botões de ação em cada página.

---

## 🚀 Como Usar

1. Acesse `http://localhost:3000/admin`
2. Faça login com as credenciais fornecidas
3. Explore o dashboard com as métricas de vendas
4. Gerencie produtos na seção "Produtos"
5. Analise dados detalhados em "Analytics"

---

## 💡 Dados de Demonstração

O painel vem pré-preenchido com:
- ✅ 4 produtos cadastrados
- ✅ 357 pedidos totais
- ✅ R$ 265.000 em vendas (últimos 7 dias)
- ✅ Estatísticas de crescimento
- ✅ Rankings de produtos mais vendidos

---

**Desenvolvido com Next.js 14, React, TypeScript e Tailwind CSS**

