# CodaWeb Notes: App Web Full-Stack Dockerizado

<div align="center">

[![Deploy Status](https://img.shields.io/badge/deploy-ativo-brightgreen)](https://notes.codaweb.com.br/) [![Docker](https://img.shields.io/badge/Docker-100%25-blue?logo=docker)](https://docker.com/) [![Node.js](https://img.shields.io/badge/Node.js-v20+-green?logo=node.js)](https://nodejs.org/) [![React](https://img.shields.io/badge/NextJS-15?logo=react)](https://reactjs.org/)

Acesse em: **[https://notes.codaweb.com.br](https://notes.codaweb.com.br/)**

Aplicação **full-stack** para gerenciamento de anotações - criação, compartilhamento e mapeamento de tags e palavras-chaves. Projeto *dockerizado* desenvolvido com foco em **aprendizado** de containerização, orquestração e integração front-end/back-end.

</div>

---

# 💡 The idea

Criar um app de anotações/notas com função de criar, editar, gerenciar e compartilhar notas de forma simples e intuitiva.

Implementar dockerização de projeto, ampliar conhecimento em Postgres, ciber segurança e

# Funcionalidades

### 🔐 **Autenticação & Segurança**

- Sistema completo de autenticação JWT
- Integração com Google OAuth 2.0 - *ainda em autorização do app junto ao Google*
- Integração com Github OAuth  - *em desenvolvimento*
- Cookies HttpOnly
- Middleware de autenticação e validação de dados
- Rate limiting e proteção CORS

### 📝 **Gerenciamento de Notas**

- CRUD do fluxos de notas
- Sistema de blocos e categorização ( texto, código, parágrafo, ...)
- Interface drag-and-drop
- Pesquisa e filtros de notas e páginas
- Backup e exclusão total por parte do usuário

### 🔧 **DevOps & Infraestrutura**

- Dockerizado (desenvolvimento e produção)
- Hot-reload com Docker Compose Watch
- CI/CD
- Proxy reverso com Nginx - para deplay em container

---

## 🛠️ Stacks

### **Frontend**

```javascript
Next JS 15        // Framework de frontend
TailwindCSS       // Framework CSS
Axios             // HTTP client
Next Router      // Roteamento
```

### **Backend**

```javascript
Node.js           // Runtime
Express.js 4.21   // Framework web
JavaScript        // Linguagem principal
JWT               // Autenticação
Nodemailer        // Envio de emails
AWS S3 - DO       // Storage de arquivos
PostgreSQL        // Banco de Dados Relacional
```

### **DevOps**

```yaml
Docker            # Containerização
Docker Compose    # Orquestração
Nginx             # Proxy reverso
Multi-stage       # Builds otimizados
Hot-reload        # Desenvolvimento ágil
```

---

### Pré-requisitos

- [Docker](https://www.docker.com/get-started) (v20+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2+)

### Desenvolvimento

```bash
# Clone o repositório
git clone https://github.com/eugaelgomes/notes-web-app.git
cd notes-web-app

# Configure as variáveis de ambiente
cp docker-compose.override.example.yml docker-compose.override.yml

# Inicie o ambiente de desenvolvimento
docker compose up --build

# Acesse a aplicação
# Frontend: http://localhost:3000
# Backend:  http://localhost:8080
```

### Produção

```bash
# Build das imagens de produção
docker compose -f docker-compose.yml build

# Deploy em produção
docker compose -f docker-compose.yml up -d
```

---

## 📂 Estrutura do Projeto

```
notes-web-app/
├── 🖥️  web/                    # Frontend React
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── pages/            # Páginas da aplicação
│   │   ├── services/         # Serviços e API clients
│   │   ├── context/          # Context API (Auth, Notes)
│   │   └── hooks/            # Custom hooks
│   ├── Dockerfile            # Container frontend
│   └── package.json
│
├── ⚙️  server/                 # Backend Node.js
│   ├── src/
│   │   ├── controllers/      # Controladores das rotas
│   │   ├── middlewares/      # Middlewares personalizados
│   │   ├── repositories/     # Camada de dados
│   │   ├── routes/           # Definição das rotas
│   │   └── services/         # Serviços (DB, Email, Storage)
│   ├── docs/                 # Documentação da API
│   ├── Dockerfile            # Container backend
│   └── package.json
│
├── 🐳 docker-compose.yml       # Orquestração principal
├── 🔧 docker-compose.override.yml # Configurações locais
└── 📋 PRODUCTION_SETUP.md     # Guia de produção
```

---

## ⚡ Hot-Reload

**Docker Compose Watch** para sincronização em tempo real:

```yaml
develop:
  watch:
    - action: sync          # Sincroniza mudanças
      path: ./src
      target: /app/src
    - action: rebuild       # Rebuild em mudanças críticas
      path: ./package.json
```

---

## 🔐 Deploy

### Variáveis de Ambiente

Consulte `docker-compose.override.example.yml` para configurações completas.

### Deploy em Produção

Veja instruções detalhadas em [PRODUCTION_SETUP.md
](./PRODUCTION_SETUP.md)

---

# 💻 The journey

O intuito do projeto no geral foi muito voltado para o viés autodidata, claro que com apoio de IA e acompanhamento de discurssões sobre segurança no desenvolvimento. Cada funcionalidade foi criada com através de muitos "porquês" e "e se" feitos ao Claude Code, com o conhecimento acumulado nas aulas teóricas da faculdade e estudo prático em cursos de programação em js/ts.

### ⛰️ Trilha

1. **Docker Compose**: Volumes, networks, depends_on, services
2. **Develop.watch**: Sincronização de arquivos em tempo real
3. **Multi-stage builds**: Otimização para produção
4. **Nginx & Proxy**: Roteamento e balanceamento
5. **Postgres:** Tables structure, relações, cascade, índices.

---

<div align="center">

**Feito em algumas madrugadas por [Gael Gomes](https://github.com/eugaelgomes)**

[notes.codaweb.com.br](https://notes.codaweb.com.br/) • [hello@gaelgomes.dev](mailto:hello@gaelgomes.dev) • [in/gael-rene-gomes](https://linkedin.com/in/gael-rene-gomes)

</div>
