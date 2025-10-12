# Database Setup - Codaweb Notes

Este documento contém as instruções para configurar o banco de dados PostgreSQL para o projeto Codaweb Notes.

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Criação do Banco de Dados](#criação-do-banco-de-dados)
- [Estrutura das Tabelas](#estrutura-das-tabelas)
- [Scripts de Inicialização](#scripts-de-inicialização)
- [Configuração da Aplicação](#configuração-da-aplicação)
- [Conexão e Teste](#conexão-e-teste)
- [Backup e Restore](#backup-e-restore)
- [Troubleshooting](#troubleshooting)

## 🔧 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- PostgreSQL 13+ 
- Node.js 18+
- npm ou yarn
- Cliente PostgreSQL (psql, pgAdmin, DBeaver, etc.)

## ⚙️ Configuração do Ambiente

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na pasta `server/` - para rodar localmente - com as seguintes configurações:

```env
# Database Configuration
DATABASE_HOST_URL=localhost
DATABASE_SERVICE_PORT=
DATABASE_USERNAME=seu_usuario
DATABASE_PASSWORD=sua_senha
DATABASE_NAME=codaweb_notes

# SSL Configuration (opcional para desenvolvimento local)
SSL_CERTIFICATE=path/to/certificate.pem
```

### 2. Dependências

O projeto já está configurado com as dependências necessárias no `package.json`:

- `pg`: Driver PostgreSQL para Node.js
- `connect-pg-simple`: Para sessões PostgreSQL
- `bcrypt`: Para hash de senhas

## 🗄️ Criação do Banco de Dados

### 1. Conectar ao PostgreSQL

```bash
psql -U postgres
```

### 2. Criar o Banco de Dados

```sql
CREATE DATABASE codaweb_notes;
```

### 3. Criar Usuário (opcional)

```sql
CREATE USER codaweb_user WITH PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE codaweb_notes TO codaweb_user;
```

### 4. Conectar ao Banco Criado

```bash
psql -U codaweb_user -d codaweb_notes
```

## 📊 Estrutura das Tabelas

> **Nota**: As queries de criação das tabelas devem ser inseridas abaixo. 
> Esta seção serve como template para você adicionar os scripts SQL completos.

### Tabela: users

```sql
-- TODO: Inserir query de criação da tabela users
-- Sugestão de campos baseada na análise do código:
-- id, email, password, name, profile_image, google_id, created_at, updated_at
```

### Tabela: notes

```sql
-- TODO: Inserir query de criação da tabela notes
-- Sugestão de campos baseada na análise do código:
-- id, user_id, title, content, created_at, updated_at
```

### Tabela: blocks

```sql
-- TODO: Inserir query de criação da tabela blocks
-- Para funcionalidade de blocos de notas
```

### Tabela: sessions (para express-session)

```sql
-- Tabela para gerenciamento de sessões
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX "IDX_session_expire" ON "session" ("expire");
```

### Índices Recomendados

```sql
-- TODO: Adicionar índices para otimização
-- Exemplos:
-- CREATE INDEX idx_users_email ON users(email);
-- CREATE INDEX idx_notes_user_id ON notes(user_id);
-- CREATE INDEX idx_notes_created_at ON notes(created_at);
```

## 🚀 Scripts de Inicialização

### Script de Inicialização Completa

Crie um arquivo `init_database.sql` com todas as queries:

```sql
-- =========================================
-- SCRIPT DE INICIALIZAÇÃO DO BANCO
-- =========================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TODO: Adicionar todas as queries de criação de tabelas aqui

-- Dados iniciais (se necessário)
-- INSERT INTO ...

-- Verificação final
SELECT 'Database initialized successfully!' as status;
```

### Executar Script de Inicialização

```bash
psql -U codaweb_user -d codaweb_notes -f init_database.sql
```

## 🔗 Configuração da Aplicação

### Conexão com o Banco

O arquivo de conexão está localizado em `src/services/db/db-connection.js` e utiliza:

- **Pool de Conexões**: Para melhor performance
- **SSL**: Configurado para produção
- **Tratamento de Erros**: Com logs detalhados

### Exemplo de Uso

```javascript
const { executeQuery } = require('@/services/db/db-connection');

// Exemplo de consulta
const users = await executeQuery('SELECT * FROM users WHERE active = $1', [true]);
```

## ✅ Conexão e Teste

### 1. Testar Conexão

Execute o seguinte script para testar a conexão:

```javascript
// test-connection.js
const { getConnection } = require('./src/services/db/db-connection');

async function testConnection() {
  try {
    const client = await getConnection();
    console.log('✅ Conexão com o banco estabelecida com sucesso!');
    
    const result = await client.query('SELECT NOW()');
    console.log('📅 Timestamp do servidor:', result.rows[0].now);
    
    client.release();
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
  }
}

testConnection();
```

### 2. Executar Teste

```bash
cd server
node test-connection.js
```

### 3. Verificar Tabelas Criadas

```sql
\dt  -- Lista todas as tabelas
\d nome_da_tabela  -- Descreve estrutura da tabela
```

## 💾 Backup e Restore

### Criar Backup

```bash
# Backup completo
pg_dump -U codaweb_user -h localhost codaweb_notes > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup apenas da estrutura
pg_dump -U codaweb_user -h localhost --schema-only codaweb_notes > schema_backup.sql

# Backup apenas dos dados
pg_dump -U codaweb_user -h localhost --data-only codaweb_notes > data_backup.sql
```

### Restaurar Backup

```bash
# Restaurar backup completo
psql -U codaweb_user -d codaweb_notes < backup_20241221_143000.sql

# Restaurar apenas estrutura
psql -U codaweb_user -d codaweb_notes < schema_backup.sql
```

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão

```
Pool connection failed: connect ECONNREFUSED
```

**Soluções:**
- Verificar se PostgreSQL está rodando: `sudo systemctl status postgresql`
- Confirmar host e porta no `.env`
- Testar conexão manual: `psql -U usuario -h host -p porta -d database`

#### 2. Erro de Autenticação

```
password authentication failed
```

**Soluções:**
- Verificar credenciais no `.env`
- Confirmar se usuário existe: `\du` no psql
- Verificar permissões: `GRANT ALL PRIVILEGES ON DATABASE nome TO usuario;`

#### 3. SSL Error em Produção

```
SSL connection error
```

**Soluções:**
- Configurar certificado SSL no `.env`
- Para desenvolvimento, usar `ssl: { rejectUnauthorized: false }`

#### 4. Tabela Não Encontrada

```
relation "table_name" does not exist
```

**Soluções:**
- Verificar se as tabelas foram criadas: `\dt`
- Executar scripts de inicialização
- Verificar schema correto

### Logs Úteis

```javascript
// Habilitar logs detalhados
const pool = new Pool({
  // ... outras configurações
  log: (text, params) => {
    console.log('Executed query:', text);
    console.log('With params:', params);
  }
});
```

### Comandos de Manutenção

```sql
-- Verificar conexões ativas
SELECT * FROM pg_stat_activity WHERE datname = 'codaweb_notes';

-- Análise de performance
ANALYZE;

-- Reindexar tabelas
REINDEX DATABASE codaweb_notes;

-- Verificar tamanho das tabelas
SELECT 
    schemaname,
    tablename,
    pg_total_relation_size(schemaname||'.'||tablename)::bigint/1024/1024 as size_mb
FROM pg_tables 
WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
ORDER BY size_mb DESC;
```

## 📝 Notas Importantes

1. **Segurança**: Sempre use senhas fortes e nunca commite credenciais no código
2. **Backup**: Configure backup automático para produção
3. **Performance**: Monitore queries lentas e otimize índices
4. **Versionamento**: Use migrations para mudanças de schema
5. **Ambiente**: Mantenha configurações diferentes para dev/staging/prod

## 📞 Suporte

Para problemas relacionados ao banco de dados:

1. Verifique os logs da aplicação
2. Consulte este documento
3. Teste a conexão isoladamente
4. Verifique a documentação do PostgreSQL

---

**Última atualização:** Setembro 2025  
**Versão do PostgreSQL:** 13+  
**Versão do Node.js:** 18+