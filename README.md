````markdown
# 🛒 Sistema de Vendas & Gestão de Estoque

![Next.js](https://img.shields.io/badge/Next.js-13-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-3.20-blue?logo=prisma)
![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)
![License](https://img.shields.io/badge/License-MIT-green)

Sistema web completo para gestão de **vendas, estoque, emissão de recibos** e acompanhamento de métricas, desenvolvido em [Next.js](https://nextjs.org) com integração ao banco de dados via Prisma ORM.

---

## 🔥 Funcionalidades

### Funcionais
- Cadastro, edição, exclusão e listagem de produtos
- Ajuste manual e automático de estoque
- Registro e consulta de vendas
- Busca de produtos por SKU
- Dashboard com KPIs e gráficos
- Exportação de vendas para Excel
- Notificação de estoque baixo via WhatsApp
- Geração de recibo de pagamento
- API RESTful para integração

### Não Funcionais
- Interface responsiva e intuitiva
- Validação de dados no frontend e backend
- Proteção de rotas sensíveis via token
- Logs e tratamento de erros detalhados
- Arquitetura modular e escalável
- Tipos TypeScript para consistência
- Facilidade de manutenção e extensão

---

## 🏗 Arquitetura de Software

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
````

---

## 🗃 Modelagem de Dados

O sistema utiliza **Prisma ORM** para gerenciar o banco relacional.

### Tabelas Principais

* **Product**

  * `id`: Identificador único
  * `nome`, `marca`, `categoria`, `preco`, `estoque`, `sku`, `validade`
  * `createdAt`, `updatedAt`

* **Sale**

  * `id`, `total`, `paymentMethod`, `createdAt`
  * Relacionamento: possui vários **SaleItem**

* **SaleItem**

  * `id`, `saleId`, `productId`, `quantity`, `unitPrice`
  * Liga **Sale** e **Product**

### Relacionamentos

* Um **Product** pode aparecer em vários **SaleItem**
* Um **Sale** possui vários **SaleItem**
* **SaleItem** conecta **Sale** e **Product**

#### Diagrama Entidade-Relacionamento

```mermaid
erDiagram
    PRODUCT ||--o{ SALEITEM : contém
    SALE ||--o{ SALEITEM : possui
    PRODUCT {
      int id PK
      string nome
      string marca
      string categoria
      float preco
      int estoque
      string sku
      date validade
      date createdAt
      date updatedAt
    }
    SALE {
      int id PK
      float total
      string paymentMethod
      date createdAt
    }
    SALEITEM {
      int id PK
      int saleId FK
      int productId FK
      int quantity
      float unitPrice
    }
```

---

## 🔌 API - Exemplos de Endpoints

* **POST `/api/products`** — Cadastra novo produto

```json
{
  "nome": "Produto X",
  "marca": "Marca Y",
  "categoria": "Categoria Z",
  "preco": 10.5,
  "estoque": 100,
  "sku": "ABC123",
  "validade": "2025-12-31"
}
```

* **GET `/api/products`** — Lista todos os produtos

* **PUT `/api/products`** — Atualiza produto

```json
{
  "id": 1,
  "nome": "Produto X",
  "marca": "Marca Y",
  "categoria": "Categoria Z",
  "preco": 12.0,
  "estoque": 90,
  "sku": "ABC123",
  "validade": "2026-01-31"
}
```

* **PATCH `/api/products`** — Ajusta estoque

```json
{
  "productId": 1,
  "quantity": 10,
  "type": "add" // ou "remove"
}
```

* **DELETE `/api/products`** — Remove produto

```json
{
  "id": 1
}
```

---

## ⚙️ Instalação e Configuração

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/seu-repo.git
cd seu-repo
```

2. Instale dependências:

```bash
npm install
```

3. Configure variáveis de ambiente (`.env`):

```env
DATABASE_URL=""
DIRECT_URL=""
CRON_SECRET=sua_chave_secreta
WHATSAPP_PHONE_NUMBER_ID='xxxxx'
WHATSAPP_ACCESS_TOKEN='seu_token'
MANAGER_PHONE_NUMBER='seu_numero'
```

4. Rode migrations do Prisma:

```bash
npx prisma migrate deploy
```

5. Inicie a aplicação:

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 🤝 Contribuição

* Faça fork do repositório
* Crie uma branch para sua feature/correção
* Abra um pull request detalhado

---

## 📝 Licença

MIT

---

## 📬 Contato

Dúvidas ou sugestões: [santosray62@gmail.com](mailto:santosray62@gmail.com)

---

> Consulte o arquivo `prisma/schema.prisma` para detalhes completos dos campos e tipos.

```
