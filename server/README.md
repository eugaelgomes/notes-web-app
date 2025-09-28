# 📝 Codaweb Notes API

> Uma API RESTful para gerenciamento de de fluxo de requisiçõwa de Web App de Notas com autenticação segura e integração (opcional) com Google OAuth.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21+-blue.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue.svg)](https://postgresql.org/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

## 🚀 Visão Geral

A **Codaweb Notes API** é uma solução completa para criação e gerenciamento de notas estruturadas, oferecendo:

- ✅ **Autenticação** com JWT e Google OAuth 2.0
- ✅ **Gerenciamento de notas** com sistema de blocos - inspirado no [(https://notion.so)](Notion).
- ✅ **Segurança** com rate limiting e validação
- ✅ **Banco de Dados** com PostgreSQL
- ✅ **Arquitetura escalável** usando Docker

## 🏗️ Arquitetura

```
├── 📁 controllers/     # Lógica de negócio das rotas
├── 📁 middlewares/     # Validação, autenticação e segurança
├── 📁 repositories/    # Camada de acesso aos dados
├── 📁 routes/          # Definição das rotas da API
├── 📁 services/        # Serviços externos (DB, Email, Storage)
└── 📁 utils/           # Utilitários e helpers
```

## 🛠️ Tecnologias

### Core
- **Node.js** 18+ - Runtime JavaScript
- **Express.js** - Framework web minimalista
- **PostgreSQL** - Banco de dados relacional

### Autenticação & Segurança
- **JWT** - Tokens de autenticação
- **Google OAuth 2.0** - Login social
- **bcrypt** - Hash de senhas
- **Helmet** - Headers de segurança
- **Express Rate Limit** - Controle de taxa

### Infraestrutura
- **Docker** - Containerização
- **Digital Ocean Storage** - Armazenamento de arquivos/imagens
- **Nodemailer** - Envio de emails

## 🔌 Principais Endpoints

```
# Para todas as rotas usar
Endpoint Global /api/
```

### 🔐 Autenticação
```
POST   /auth/signin          # Login com email/senha
GET    /auth/sso/google         # Iniciar OAuth Google
GET    /auth/google/callback # Callback OAuth
GET    /auth/me        # Perfil do usuário autenticado
PUT    /auth/me        # Atualizar perfil
PUT    /auth/password       # Alterar senha
```

### 👤 Usuários
```
POST   /users/create-account              # Criar novo usuário
PUT    /users/:id          # Atualizar usuário
DELETE /users/:id          # Deletar usuário
```

### 📝 Notas
```
GET    /notes              # Listar notas do usuário
GET    /notes/:id          # Obter nota específica
POST   /notes              # Criar nova nota
PUT    /notes/:id          # Atualizar nota
DELETE /notes/:id          # Deletar nota
POST   /notes/complete     # Marcar nota como completa
```

### 🧩 Blocos (Dentro das Notas)
```
GET    /notes/:noteId/blocks           # Listar blocos da nota
POST   /notes/:id/blocks              # Criar bloco
PUT    /notes/:noteId/blocks/:blockId # Atualizar bloco
DELETE /notes/:noteId/blocks/:blockId # Deletar bloco
PUT    /notes/:noteId/blocks/reorder  # Reordenar blocos
```

### 🔑 Recuperação de Senha
```
POST   /password/forgot-password    # Solicitar reset de senha
POST   /password/reset-password     # Confirmar reset com token
```

## ⚡ Quick Start

### 1. Pré-requisitos
```bash
# Dependências necessárias
- Node.js 18+
- PostgreSQL 13+
- Docker (opcional)
```

### 2. Instalação
```bash
# Clone o repositório
git clone <repository-url>
cd codaweb-notes/server

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
```

### 3. Configuração do Banco
```bash
# Veja instruções detalhadas em:
# DATABASE_SETUP.md
```

### 4. Executar a Aplicação

#### Desenvolvimento
```bash
npm run dev
```

#### Produção
```bash
npm run build
npm start
```

#### Docker
```bash
# Na raiz do projeto
docker-compose up
```

## 🔧 Configuração

### Variáveis de Ambiente Essenciais

```env
# Server
PORT=8080
NODE_ENV=development

# Database
DATABASE_HOST_URL=localhost
DATABASE_SERVICE_PORT=5432
DATABASE_USERNAME=seu_usuario
DATABASE_PASSWORD=sua_senha
DATABASE_NAME=codaweb_notes

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app

# AWS S3 (opcional)
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
AWS_BUCKET_NAME=seu_bucket
```

## 🔒 Segurança

### Middlewares de Segurança Implementados

- **Rate Limiting**: Previne ataques de força bruta
- **CORS**: Controle de origem das requisições
- **Helmet**: Headers de segurança HTTP
- **JWT Verification**: Autenticação baseada em tokens
- **Input Validation**: Validação de dados de entrada
- **IP Tracking**: Monitoramento de endereços IP

### Autenticação

A API suporta duas formas de autenticação:

1. **JWT Local**: Email + senha com token JWT
2. **Google OAuth 2.0**: Login social integrado

## 📊 Features Principais

### Sistema de Notas
- ✅ CRUD completo de notas
- ✅ Sistema de blocos estruturados
- ✅ Reordenação de blocos
- ✅ Marcação de conclusão

### Gerenciamento de Usuários
- ✅ Registro e login seguro
- ✅ Perfis de usuário
- ✅ Upload de foto de perfil
- ✅ Recuperação de senha

### Integrações
- ✅ Google OAuth 2.0
- ✅ AWS S3 para arquivos
- ✅ Email transacional

## 📁 Estrutura de Dados

### Nota (Note)
```json
{
  "id": "uuid",
  "title": "Título da nota",
  "content": "Conteúdo principal",
  "user_id": "uuid",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Bloco (Block)
```json
{
  "id": "uuid",
  "note_id": "uuid",
  "type": "text|image|list",
  "content": "Conteúdo do bloco",
  "order": 1,
  "created_at": "timestamp"
}
```

## 🧪 Scripts Disponíveis

```bash
npm run dev        # Desenvolvimento com hot reload
npm run build      # Build para produção
npm start          # Executar versão de produção
npm test           # Executar testes (Jest)
npm run format     # Formatar código (Prettier)
npm run format:check # Verificar formatação
```

## 📚 Documentação Adicional

- 📄 [Database Setup](./docs/DATABASE_SETUP.md) - Configuração do banco de dados
- 📄 [Blocks API](./docs/BLOCKS_API_DOCUMENTATION.md) - API de blocos detalhada
- 📄 [Google Auth Setup](./docs/GOOGLE_AUTH_SETUP.md) - Configuração OAuth
- 📄 [SMTP Service](./docs/SMTP_SERVICE_SETUP.MD) - Configuração de email

## 🐛 Troubleshooting

### Problemas Comuns

#### Erro de Conexão com Banco
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Testar conexão
psql -U usuario -d codaweb_notes -c "SELECT 1;"
```

#### Erro de Autenticação Google
```bash
# Verificar variáveis de ambiente
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET
```

#### Rate Limit Excedido
```bash
# Aguardar o reset do limite ou ajustar configurações
# em src/middlewares/limiters.js
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Gael Gomes**
- GitHub: [@eugaelgomes](https://github.com/eugaelgomes)
- Aceito uma estrelinha nesse projeto hahaha!

---

⚡ **Status**: Em desenvolvimento ativo  
🏷️ **Versão**: 1.0.0  
📅 **Última atualização**: Setembro 2025