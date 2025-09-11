# Sistema de Vendas & Gestão de Estoque

Este projeto é um sistema completo para gestão de vendas, estoque, emissão de recibos e acompanhamento de métricas, desenvolvido em [Next.js](https://nextjs.org) com integração ao banco de dados via Prisma.

---

## Requisitos Funcionais

- **Gestão de Produtos**
  - Cadastro, edição e exclusão de produtos com campos: nome, marca, categoria, preço, estoque, SKU, validade.
  - Validação dos dados do produto no frontend e backend.
  - Filtros e busca por produtos.

- **Gestão de Estoque**
  - Ajuste manual de estoque.
  - Decremento automático de estoque ao realizar vendas.
  - Notificação de estoque baixo via WhatsApp (Meta API).

- **Ponto de Venda (PDV)**
  - Busca de produtos por SKU (manual ou via scanner).
  - Adição de produtos ao carrinho.
  - Seleção de forma de pagamento (PIX, Dinheiro, Débito, Crédito).
  - Finalização de venda com registro no banco e decremento de estoque.
  - Geração de recibo após venda.

- **Dashboard**
  - Visualização de KPIs: total de vendas, total de pedidos, ticket médio, produto mais vendido.
  - Gráficos de distribuição de vendas por produto.
  - Exportação de vendas do dia para Excel.
  - Limpeza de histórico de vendas.

- **Recibo de Pagamento**
  - Visualização detalhada da venda realizada.
  - Geração de PDF do recibo.
  - Navegação entre PDV e recibo.

- **API**
  - Endpoints RESTful para produtos, vendas, decremento de estoque, consulta por SKU e verificação de validade.
  - Integração com Prisma para persistência de dados.

---

## Requisitos Não Funcionais

- **Performance**
  - Carregamento assíncrono dos dados.
  - Atualização periódica dos dados no dashboard.
  - Paginação e filtros para grandes volumes de produtos.

- **Segurança**
  - Proteção de rotas sensíveis via token secreto (ex: verificação de validade).
  - Validação de dados em todas as operações de API.
  - Tratamento de erros e logs detalhados.

- **Usabilidade**
  - Interface responsiva e intuitiva.
  - Suporte a atalhos de teclado no PDV.
  - Feedback visual para operações (notificações, loading, erros).

- **Escalabilidade**
  - Arquitetura modular (separação entre app, lib, types, utils, components).
  - Facilidade para adicionar novas integrações (ex: outros métodos de notificação).

- **Manutenibilidade**
  - Código organizado por funcionalidades.
  - Tipos TypeScript para garantir consistência dos dados.
  - Documentação de funções e interfaces.

---

## Diagrama de Arquitetura

```mermaid
graph TD
    subgraph Frontend (Next.js)
        A1[Gestão de Estoque]
        A2[Ponto de Venda]
        A3[Dashboard]
        A4[Recibo de Pagamento]
        A5[Header/Componentes]
    end

    subgraph Backend (API Routes)
        B1[/api/products]
        B2[/api/sales]
        B3[/api/decrement-stock]
        B4[/api/sku]
        B5[/api/check-expiry]
    end

    subgraph Lib
        L1[Prisma ORM]
        L2[Axios]
        L3[StockChecker]
        L4[WhatsApp Integration]
    end

    subgraph Database
        D1[(PostgreSQL/MySQL via Prisma)]
    end

    A1 --> B1
    A2 --> B2
    A2 --> B3
    A2 --> B4
    A3 --> B2
    A3 --> B1
    A4 --> B2
    B1 --> L1
    B2 --> L1
    B3 --> L1
    B4 --> L1
    B5 --> L1
    B3 --> L3
    B5 --> L4
    L1 --> D1
```

---

## Estrutura de Pastas

- `src/app/` — Páginas e rotas do Next.js (PDV, estoque, dashboard, recibo, API)
- `src/components/` — Componentes reutilizáveis (ex: Header)
- `src/lib/` — Integrações e utilitários (Prisma, Axios, StockChecker, WhatsApp)
- `src/types/` — Tipos TypeScript para dados e APIs
- `src/utils/` — Funções utilitárias (ex: categorias)

---

## Como rodar

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Referências

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma ORM](https://www.prisma.io/docs)
- [Meta WhatsApp API](https://developers.facebook.com/docs/whatsapp)
