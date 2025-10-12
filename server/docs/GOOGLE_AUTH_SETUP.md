# Guia de Configuração - Autenticação Google OAuth

## Visão Geral

Esta implementação permite que usuários façam login usando suas contas Google através do protocolo OAuth 2.0. O sistema automaticamente:

- Cria novos usuários quando eles fazem login pela primeira vez com Google
- Vincula contas Google existentes a usuários que já possuem cadastro por email
- Marca usuários como autenticados via Google na coluna `auth_with_google`

## Configuração Necessária

### 1. Configuração no Google Cloud Console

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Habilite a Google+ API
4. Vá para "Credenciais" e crie credenciais OAuth 2.0
5. Configure as URLs de redirect autorizadas:
   - Desenvolvimento: `http://localhost:8080/auth/signin/sso/google/callback`
   - Produção: `https://seudominio.com/auth/signin/sso/google/callback`

### 2. Variáveis de Ambiente

Adicione no seu arquivo `.env`:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:8080/auth/signin/sso/google/callback

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
```

### 3. Estrutura do Banco de Dados

Execute o script SQL para adicionar as colunas necessárias:

```bash
psql -d sua_database -f sql/add_google_auth_columns.sql
```

## Endpoints da API

### Iniciar Autenticação Google
```
GET /auth/signin/sso/google
```

Redireciona o usuário para a página de autenticação do Google.

### Callback do Google
```
GET /auth/signin/sso/google/callback?code=AUTHORIZATION_CODE
```

Processa o retorno do Google e:
- Valida o código de autorização
- Obtém informações do usuário
- Cria ou atualiza o usuário no banco
- Gera JWT token
- Redireciona para o frontend

## Fluxo de Autenticação

1. **Frontend** → `GET /auth/signin/sso/google`
2. **Servidor** → Redireciona para Google OAuth
3. **Google** → Usuário autoriza a aplicação
4. **Google** → `GET /auth/signin/sso/google/callback?code=...`
5. **Servidor** → Troca código por token de acesso
6. **Servidor** → Obtém dados do usuário do Google
7. **Servidor** → Cria/atualiza usuário no banco
8. **Servidor** → Gera JWT e define cookie
9. **Servidor** → Redireciona para `${FRONTEND_URL}/home?auth=success`

## Comportamentos do Sistema

### Novo Usuário (Primeiro Login)
- Cria registro na tabela `users`
- Define `auth_with_google = true`
- Gera `username` único baseado no email
- Salva `google_id`, `name`, `email`, `avatar_url`

### Usuário Existente (por email)
- Atualiza registro existente
- Define `auth_with_google = true`
- Adiciona `google_id` ao registro
- Atualiza `avatar_url` se fornecido

### Usuário Já Vinculado
- Faz login normalmente
- Atualiza `avatar_url` se necessário

## Tratamento de Erros

### Códigos de Erro
- `400` - Código de autorização não encontrado
- `500` - Erro interno (problemas com APIs do Google ou banco)

### Redirecionamentos de Erro
Em caso de erro, redireciona para:
```
${FRONTEND_URL}/login?error=auth_failed
```

## Segurança

- Tokens JWT são armazenados em cookies `HttpOnly`
- Cookies são seguros em produção (`secure: true`)
- SameSite configurado para CORS em produção
- Validação de origem via variáveis de ambiente

## Estrutura da Resposta

Após login bem-sucedido, o cookie contém JWT com payload:

```javascript
{
  userId: "uuid",
  username: "usuario_123456789",
  email: "usuario@gmail.com",
  name: "Nome do Usuário"
}
```

## Frontend Integration

No frontend, após redirecionamento bem-sucedido:

```javascript
// Verificar parâmetros da URL
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('auth') === 'success') {
  // Login realizado com sucesso
  // O token já está no cookie
  // Redirecionar para página principal ou fazer fetch dos dados do usuário
}

if (urlParams.get('error') === 'auth_failed') {
  // Exibir mensagem de erro
  alert('Erro na autenticação com Google. Tente novamente.');
}
```

## Monitoramento

Para debugar problemas:

1. Verifique os logs do servidor
2. Confirme que as variáveis de ambiente estão corretas
3. Teste se as URLs de callback estão registradas no Google Console
4. Verifique se o banco de dados tem as colunas necessárias