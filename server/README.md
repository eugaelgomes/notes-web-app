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

## 🛠️ Tecnologias e Bibliotecas

### Core
- **Node.js** 18+ - Runtime JavaScript
- **Express.js** 4.21+ - Framework web minimalista e rápido
- **TypeScript** 5.9+ - Superset JavaScript com tipagem estática
- **PostgreSQL** - Banco de dados relacional

### Autenticação & Segurança
- **jsonwebtoken** (9.0+) - Geração e validação de JWT
- **express-jwt** (8.4+) - Middleware de autenticação JWT
- **Google OAuth 2.0** - Login social via Google
- **google-auth-library** (9.14+) - Biblioteca oficial Google
- **passport** (0.7+) - Middleware de autenticação
- **passport-google-oauth20** - Estratégia Google OAuth
- **bcrypt** (6.0+) - Hash seguro de senhas
- **helmet** (7.1+) - Headers de segurança HTTP
- **express-rate-limit** (7.2+) - Proteção contra força bruta
- **cors** (2.8+) - Controle de acesso entre origens
- **express-session** (1.18+) - Gerenciamento de sessões
- **connect-pg-simple** (10.0+) - Armazenamento de sessões no PostgreSQL

### Validação e Processamento
- **express-validator** (7.0+) - Validação de dados de entrada
- **multer** (2.0+) - Upload de arquivos multipart/form-data
- **sharp** (0.33+) - Processamento e otimização de imagens
- **body-parser** (1.20+) - Parser de corpo de requisição
- **cookie-parser** (1.4+) - Parser de cookies

### Banco de Dados e Storage
- **pg** (8.16+) - Cliente PostgreSQL nativo
- **@aws-sdk/client-s3** (3.892+) - SDK AWS S3 v3
- **Digital Ocean Spaces** - Armazenamento compatível com S3

### Email e Comunicação
- **nodemailer** (7.0+) - Envio de emails via SMTP
- **axios** (1.7+) - Cliente HTTP para requisições externas

### Utilitários
- **dotenv** (16.4+) - Gerenciamento de variáveis de ambiente
- **module-alias** (2.2+) - Aliases para importações
- **request-ip** (3.3+) - Detecção de IP real do cliente

### DevOps e Infraestrutura
- **Docker** - Containerização da aplicação
- **nodemon** (3.1+) - Auto-reload em desenvolvimento
- **ts-node** (10.9+) - Execução direta de TypeScript

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

### Variáveis de Ambiente

O arquivo `.env.example` contém todas as variáveis necessárias. Copie-o e configure:

```bash
cp .env.example .env
```

#### 🗄️ Banco de Dados
```env
DATABASE_NAME=codaweb_notes
DATABASE_HOST_URL=localhost
DATABASE_SERVICE_PORT=5432
DATABASE_USERNAME=seu_usuario
DATABASE_PASSWORD=sua_senha_segura
SSL_CERTIFICATE=           # Opcional: certificado SSL para conexão
```

#### 🔐 Autenticação e Sessões
```env
SESSION_SECRET=seu_session_secret_super_seguro_aqui
SECRET_KEY=sua_chave_secreta_para_jwt
SECRET_KEY_VARIABLE=outra_chave_secreta_opcional
```

#### 📧 Serviço de Email (SMTP)
```env
EMAIL_HOSTNAME=smtp.gmail.com         # Host do servidor SMTP
EMAIL_PORT=587                        # Porta (587 para TLS, 465 para SSL)
EMAIL_USERNAME=seu_email@gmail.com
EMAIL_PASSWORD=sua_senha_de_app       # Senha de app (não a senha do email)
```

**Nota:** Para Gmail, use [senhas de aplicativo](https://support.google.com/accounts/answer/185833).

#### 🌍 Servidor e CORS
```env
NODE_ENV=development                  # development | production
APP_PORT=8080                         # Porta do servidor

# CORS - Múltiplas origens separadas por vírgula
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:5173,https://app.seudominio.com

COOKIE_DOMAIN=localhost               # Domínio para cookies
```

#### 🔑 OAuth - Google
```env
GOOGLE_CLIENT_ID=seu_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8080/api/auth/signin/sso/google/callback
```

**Como obter credenciais Google:**
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto e ative a Google+ API
3. Configure OAuth 2.0 em "Credenciais"
4. Veja guia completo em: [docs/GOOGLE_AUTH_SETUP.md](./docs/GOOGLE_AUTH_SETUP.md)

#### 🐙 OAuth - GitHub (Opcional)
```env
GITHUB_CLIENT_ID=seu_github_client_id
GITHUB_CLIENT_SECRET=seu_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:8080/api/auth/signin/sso/github/callback
```

#### ☁️ Digital Ocean Spaces (Storage)
```env
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
DO_SPACES_ACCESS_KEY=sua_access_key
DO_SPACES_SECRET_KEY=sua_secret_key
DO_SPACES_BUCKET_NAME=seu_bucket_name
DO_SPACES_REGION=nyc3                 # Região do datacenter
```

**Regiões disponíveis:** `nyc3`, `sfo3`, `ams3`, `sgp1`, `fra1`, `blr1`

#### 🎨 Frontend
```env
FRONTEND_URL=http://localhost:3000    # URL do app React/Next.js
```

#### 📍 IP Tracking (Opcional)
```env
TOKEN_IP=seu_token_ipinfo             # Token para ipinfo.io (geolocalização)
```

### ⚙️ Configurações Importantes

#### Rate Limiting
Configure em `src/middlewares/security/limiters.js`:
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 100                   // 100 requisições por IP
});
```

#### CORS
As origens permitidas são configuradas via `ALLOWED_ORIGINS`. Suporta:
- Múltiplas origens: `http://localhost:3000,https://app.com`
- Wildcards: `https://*.exemplo.com`
- IPs: `http://192.168.1.100:3000`

#### Session Store
As sessões são armazenadas no PostgreSQL via `connect-pg-simple`:
```javascript
store: new pgSession({
  pool: pool,           // Pool de conexões
  tableName: 'sessions' // Tabela de sessões
})
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
# Desenvolvimento
npm run dev              # Inicia servidor com nodemon + ts-node (hot reload)

# Produção
npm run build            # Transpila TypeScript para JavaScript (Babel)
npm start                # Executa versão transpilada (dist/)

# Qualidade de Código
npm run format           # Formata código com Prettier
npm run format:check     # Verifica formatação sem modificar
npm test                 # Executa testes (Jest)

# Utilitários
npm run clean            # Remove build anterior (dist/)
```

### 📦 Estrutura de Build

```
server/
├── src/              # Código TypeScript/JavaScript original
├── dist/             # Código transpilado (produção)
└── node_modules/     # Dependências
```

**Processo de Build:**
1. `npm run build` → Babel transpila `src/` para `dist/`
2. `npm start` → Node executa `dist/index.js`

## 📚 Documentação Adicional

- 📄 [Base Documentation](./documentation/base.md) - Documentação técnica completa
- 📄 [Database Setup](./docs/DATABASE_SETUP.md) - Configuração do banco de dados
- 📄 [Blocks API](./docs/BLOCKS_API_DOCUMENTATION.md) - API de blocos detalhada
- 📄 [Backup API](./docs/BACKUP_API_DOCUMENTATION.md) - API de backup e exportação
- 📄 [Google Auth Setup](./docs/GOOGLE_AUTH_SETUP.md) - Configuração OAuth Google
- 📄 [SMTP Service](./docs/SMTP_SERVICE_SETUP.MD) - Configuração de email
- 📄 [Routes Map](./docs/ROUTES_MAP.md) - Mapa completo de rotas

## 🐛 Troubleshooting

### Problemas Comuns

#### ❌ Erro de Conexão com Banco de Dados
```bash
# 1. Verificar se PostgreSQL está rodando
sudo systemctl status postgresql  # Linux
brew services list                # macOS
pg_ctl status                     # Windows

# 2. Testar conexão manual
psql -h localhost -U seu_usuario -d codaweb_notes -c "SELECT 1;"

# 3. Verificar variáveis .env
grep DATABASE .env

# 4. Criar tabela de sessões (se não existir)
psql -U seu_usuario -d codaweb_notes -f sql/create_sessions_table.sql
```

**Erro comum:** `ECONNREFUSED` → PostgreSQL não está rodando ou host/porta incorretos

#### ❌ Erro de Autenticação Google OAuth
```bash
# 1. Verificar variáveis
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET

# 2. Verificar redirect URI no Google Console
# Deve ser exatamente: http://localhost:8080/api/auth/signin/sso/google/callback

# 3. Verificar se Google+ API está ativada no projeto
```

**Erro comum:** `redirect_uri_mismatch` → URI de callback não corresponde

#### ❌ Rate Limit Excedido
```javascript
// Ajustar em: src/middlewares/security/limiters.js
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // Aumentar janela de tempo
  max: 200                   // Aumentar limite
});
```

#### ❌ Erro ao Enviar Email
```bash
# 1. Para Gmail, usar senha de aplicativo (não a senha normal)
# 2. Verificar configurações
grep EMAIL .env

# 3. Testar porta e host
nc -zv smtp.gmail.com 587
```

**Erro comum:** `Invalid login` → Use senha de aplicativo do Gmail

#### ❌ Erro de Upload de Imagem
```bash
# 1. Verificar credenciais Digital Ocean Spaces
grep DO_SPACES .env

# 2. Verificar permissões do bucket
# No painel DO: Bucket Settings → CORS → Adicionar origem permitida

# 3. Limitar tamanho em: src/middlewares/data/image-validator.js
```

#### ❌ Módulo não Encontrado (Module Not Found)
```bash
# 1. Limpar e reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# 2. Verificar aliases em tsconfig.json e babel.config.js
# 3. Rebuild do projeto
npm run build
```

#### ❌ Port Already in Use
```bash
# Linux/macOS
lsof -ti:8080 | xargs kill -9

# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process

# Ou alterar porta no .env
APP_PORT=8081
```

### 🔍 Debug Mode

Ative logs detalhados:
```env
NODE_ENV=development
DEBUG=express:*
```

Execute com logs:
```bash
DEBUG=* npm run dev
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
📅 **Última atualização**: Novembro 2025

---

## 🔗 Links Úteis

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [JWT Introduction](https://jwt.io/introduction)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Digital Ocean Spaces Docs](https://docs.digitalocean.com/products/spaces/)
- [Nodemailer Documentation](https://nodemailer.com/about/)