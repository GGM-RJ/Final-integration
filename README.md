# Gestão de Vinhos - Symvinhos

Projeto de gestão de estoque de vinhos com arquitetura profissional separada entre Frontend e Backend.

## Estrutura do Projeto

- **gestao-vinhos-api/**: Backend em Node.js com Express e Azure Cosmos DB.
- **gestao-vinhos-front/**: Frontend em React com Vite e Tailwind CSS.

## Como Executar

### Backend
1. Entre na pasta `gestao-vinhos-api`.
2. Instale as dependências: `npm install`.
3. Configure as variáveis de ambiente no arquivo `.env`.
4. Inicie o servidor: `npm run dev`.

### Frontend
1. Entre na pasta `gestao-vinhos-front`.
2. Instale as dependências: `npm install`.
3. Configure a URL da API no arquivo `.env`.
4. Inicie o app: `npm run dev`.

## Deploy no Azure

- **Backend**: Deploy da pasta `gestao-vinhos-api` no Azure App Service.
- **Frontend**: Deploy da pasta `gestao-vinhos-front` no Azure Static Web Apps.
