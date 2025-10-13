# 📝 CodaWeb Notes: App Web Full-Stack Dockerizado

<div align="center">

[![Deploy Status](https://img.shields.io/badge/deploy-ativo-brightgreen)](https://notes.codaweb.com.br/) [![Docker](https://img.shields.io/badge/Docker-100%25-blue?logo=docker)](https://docker.com/) [![Node.js](https://img.shields.io/badge/Node.js-v20+-green?logo=node.js)](https://nodejs.org/) [![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)](https://reactjs.org/)

**Acesse em: [https://notes.codaweb.com.br](https://notes.codaweb.com.br/)**

Aplicação **full-stack** para gerenciamento de notas, 100% containerizada com Docker, desenvolvida com foco em **aprendizado prático** de containerização, orquestração e integração front-end/back-end.

</div>

---

# 💡 Ideia principal do projeto

### O Desafio

**Integrar** os ambientes frontend e backend, eliminando a complexidade de gerenciar múltiplos terminais e configurações manuais, enquanto implementa **hot-reload** em ambiente Docker - inclusive isso foi novo pra mim, o **Docker wactch mode**.

### A Solução

Sistema completo de notas/anotações com autenticação, containerizado com Docker Compose, featuring desenvolvimento ágil com sincronização de arquivos em tempo real.

---

## Funcionalidades

### 🔐 **Autenticação & Segurança**

- ✅ Sistema completo de autenticação JWT
- ✅ Integração com Google OAuth 2.0 - ainda em autorização do app junto ao Google
- ✅ Integração com Github OAuth  - em desenvolvimento
- ✅ Cookies HttpOnly para segurança
- ✅ Middleware de autenticação e validação
- ✅ Rate limiting e proteção CORS

### 📝 **Gerenciamento de Notas**

- ✅ CRUD do fluxos de notas e requisições
- ✅ Sistema de blocos e categorização
- ✅ Interface drag-and-drop com React Beautiful DnD
- ✅ Pesquisa e filtros de notas e páginas
- ✅ Backup e exclusão total por parte do usuário

### 🔧 **DevOps & Infraestrutura**

- ✅ 100% Dockerizado (desenvolvimento e produção)
- ✅ Hot-reload com Docker Compose Watch
- ✅ Multi-stage builds otimizados
- ✅ CI/CD
- ✅ Proxy reverso com Nginx - para deplay em container

---

## 🛠️ Stack Tecnológica

### **Frontend**

```javascript
React 18.3.1      // Framework principal
Vite 6.1.0        // Build tool e dev server
TailwindCSS       // Framework CSS
Ant Design        // Biblioteca de componentes
Axios             // HTTP client
React Router      // Roteamento
```

### **Backend**

```javascript
Node.js           // Runtime
Express.js 4.21   // Framework web
JavaScript        // Linguagem principal
PostgreSQL        // Banco de dados
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

## 🚀 Início Rápido

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
# Frontend: http://localhost:5173
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

## ⚡ Desenvolvimento com Hot-Reload

O projeto utiliza **Docker Compose Watch** para sincronização em tempo real:

```yaml
develop:
  watch:
    - action: sync          # Sincroniza mudanças
      path: ./src
      target: /app/src
    - action: rebuild       # Rebuild em mudanças críticas
      path: ./package.json
```

**Vantagens:**

- ✅ Alterações refletidas instantaneamente
- ✅ Sem necessidade de rebuild manual
- ✅ Ambiente idêntico à produção
- ✅ Desenvolvimento mais produtivo

---

## 🔐 Configuração & Deploy

### Variáveis de Ambiente

Consulte `docker-compose.override.example.yml` para configurações completas.

### Deploy em Produção

Veja instruções detalhadas em [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)

---

## 📚 Documentação

**[Clique aqui](https://documenter.getpostman.com/view/31967915/2sB3QMK95y)** para acessar a documentação da API no Postman.

- 📖 [Setup de Produção](./PRODUCTION_SETUP.md)
- 🔑 [Configuração Google Auth](./server/docs/GOOGLE_AUTH_SETUP.md)
- 🗄️ [Configuração Database](./server/docs/DATABASE_SETUP.md)
- 📧 [Setup SMTP](./server/docs/SMTP_SERVICE_SETUP.MD)
- 🔄 [API de Backup](./server/docs/BACKUP_API_DOCUMENTATION.md)
- 🧱 [API de Blocos](./server/docs/BLOCKS_API_DOCUMENTATION.md)

---

## � The journey

### O Desafio Inicial

Vindo de uma jornada focada no Frontend, o próximo passo natural era dominar a integração completa front-end/back-end. A gestão manual de ambientes e a ausência de hot-reload em Docker eram barreiras significativas.

Incialmente eu tinha grande foco no Frontend, mas esse interesse veio a se aprofundar a medida que fui conhecendo outras áreas, ferramentas de código, meu trabalho e minha faculdade. O desejo crescente nos últimos tempos me vez expandir o modo como elaboro meus projetos e a descoberta de novas ferramentas.

### A Metodologia

Utilizei **aprendizado guiado com IA** ([Gemini 2.5 Pro](https://gemini.google.com/)) para:

- ✅ Dominar Docker e containerização
- ✅ Implementar hot-reload em ambiente containerizado
- ✅ Configurar proxy reverso e networking
- ✅ Otimizar builds para produção

Para resolução de bugs e código rápido utilizei **Claude Sonnet 3.5** e **4** - no **Github Copilot**.

Além dessas fontes mais comuns, também explorei fóruns como o Reddit e o Quora para compreender melhor as boas práticas no desenvolvimento com IA, especialmente no que diz respeito à segurança e à prevenção de vulnerabilidades.

### Trilha de Aprendizado

1. **Docker Compose**: Volumes, networks, depends_on, services
2. **Develop.watch**: Sincronização de arquivos em tempo real
3. **Multi-stage builds**: Otimização para produção
4. **Nginx & Proxy**: Roteamento e balanceamento
5. **Postgres:** Tables structure, relações, cascade, índices.

---


<div align="center">

**Feito em algumas madrugadas por [Gael Gomes](https://github.com/eugaelgomes)**

[Projeto em produção](https://notes.codaweb.com.br/) • [📧 Meu contato](mailto:hello@gaelgomes.dev) • [💼 LinkedIn](https://linkedin.com/in/gael-rene-gomes)

</div>
