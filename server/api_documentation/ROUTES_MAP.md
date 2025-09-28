# 🗺️ Routes Map - Codaweb Notes API

> Mapeamento de todas as rotas da API com detalhes sobre autenticação, parâmetros, validações e respostas.

## 📋 Índice

- [Base URL](#base-url)
- [Autenticação](#-autenticação)
- [Usuários](#-usuários)
- [Notas](#-notas)
- [Blocos](#-blocos)
- [Recuperação de Senha](#-recuperação-de-senha)
- [Middlewares Globais](#middlewares-globais)
- [Códigos de Status](#códigos-de-status)
- [Headers Obrigatórios](#headers-obrigatórios)

## Base URL

```
Desenvolvimento: http://localhost:8080/api
Produção: https://your-domain.com/api
```

---

## 🔐 Autenticação

### POST `/auth/signin`
**Descrição**: Login com email e senha  
**Autenticação**: ❌ Não requerida  
**Rate Limit**: ✅ Aplicado (loginLimiter)

#### Request
```json
{
  "username": "user@example.com",
  "password": "senha123"
}
```

#### Validações
- `username`: Obrigatório, sanitizado (trim + escape)
- `password`: Obrigatório, mínimo 6 caracteres

#### Response (200)
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Nome do Usuário"
    },
    "token": "jwt_token_here",
  }
}
```

---

### GET `/auth/signin/sso/google`
**Descrição**: Iniciar autenticação OAuth Google  
**Autenticação**: ❌ Não requerida

#### Response
Redirecionamento para página de autorização do Google

---

### GET `/auth/signin/sso/google/callback`
**Descrição**: Callback da autenticação Google  
**Autenticação**: ❌ Não requerida

#### Query Parameters
- `code`: Código de autorização do Google
- `state`: Estado de validação

#### Response (200)
```json
{
  "success": true,
  "message": "Login Google realizado com sucesso",
  "data": {
    "user": { /* dados do usuário */ },
    "token": "jwt_token_here"
  }
}
```

---

### GET `/auth/me`
**Descrição**: Obter dados do perfil do usuário autenticado  
**Autenticação**: ✅ Token JWT obrigatório

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Nome do Usuário",
    "profileImage": "url_da_imagem",
    "createdAt": "2025-09-21T10:00:00Z"
  }
}
```

---

### PUT `/auth/me/update-profile`
**Descrição**: Atualizar dados do perfil  
**Autenticação**: ✅ Token JWT obrigatório

#### Request
```json
{
  "name": "Novo Nome",
  "email": "novo@email.com"
}
```

#### Response (200)
```json
{
  "success": true,
  "message": "Perfil atualizado com sucesso",
  "data": { /* dados atualizados */ }
}
```

---

### PUT `/auth/me/update-password`
**Descrição**: Alterar senha do usuário  
**Autenticação**: ✅ Token JWT obrigatório

#### Request
```json
{
  "currentPassword": "senha_atual",
  "newPassword": "nova_senha"
}
```

#### Validações
- `currentPassword`: Obrigatório
- `newPassword`: Mínimo 6 caracteres

#### Response (200)
```json
{
  "success": true,
  "message": "Senha alterada com sucesso"
}
```

---

### POST `/auth/logout`
**Descrição**: Logout do usuário (invalidar token)  
**Autenticação**: ✅ Token JWT obrigatório

#### Response (200)
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

---

### POST `/auth/refresh`
**Descrição**: Renovar token JWT usando refresh token  
**Autenticação**: ❌ Não requerida

#### Request
```json
{
  "refreshToken": "refresh_token_here"
}
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
}
```

---

## 👤 Usuários

### POST `/users/create-account`
**Descrição**: Criar nova conta de usuário  
**Autenticação**: ❌ Não requerida  
**Content-Type**: `multipart/form-data`

#### Request (Form Data)
```
name: "Nome do Usuário"
email: "user@example.com"
password: "senha123"
profileImage: <file> (opcional)
```

#### Validações
- Dados validados por `dataValidator()`
- Imagem validada por `validateCompressedImageSize`
- Upload processado por `multer`

#### Response (201)
```json
{
  "success": true,
  "message": "Conta criada com sucesso",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Nome do Usuário"
  }
}
```

---

### GET `/users/profile-image/:userId`
**Descrição**: Obter imagem de perfil de um usuário  
**Autenticação**: ❌ Não requerida

#### Parameters
- `userId`: ID do usuário (UUID)

#### Response
Retorna a imagem binária ou redirecionamento para URL

---

### GET `/users/profile-image-info/:userId`
**Descrição**: Obter informações da imagem de perfil  
**Autenticação**: ❌ Não requerida

#### Parameters
- `userId`: ID do usuário (UUID)

#### Response (200)
```json
{
  "success": true,
  "data": {
    "hasImage": true,
    "imageUrl": "https://bucket.s3.amazonaws.com/image.jpg",
    "uploadedAt": "2025-09-21T10:00:00Z"
  }
}
```

---

## 📝 Notas

> **Nota**: Todas as rotas de notas requerem autenticação JWT

### GET `/notes`
**Descrição**: Listar todas as notas do usuário autenticado  
**Autenticação**: ✅ Token JWT obrigatório

#### Query Parameters (opcionais)
```
?page=1&limit=10&search=termo&sortBy=createdAt&order=desc
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "id": "uuid",
        "title": "Título da nota",
        "content": "Conteúdo resumido...",
        "createdAt": "2025-09-21T10:00:00Z",
        "updatedAt": "2025-09-21T11:00:00Z",
        "blocksCount": 3
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

---

### GET `/notes/:id`
**Descrição**: Obter uma nota específica com todos os blocos  
**Autenticação**: ✅ Token JWT obrigatório

#### Parameters
- `id`: ID da nota (UUID)

#### Response (200)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Título da nota",
    "content": "Conteúdo principal",
    "createdAt": "2025-09-21T10:00:00Z",
    "updatedAt": "2025-09-21T11:00:00Z",
    "blocks": [
      {
        "id": "uuid",
        "type": "text",
        "content": "Conteúdo do bloco",
        "order": 1,
        "createdAt": "2025-09-21T10:05:00Z"
      }
    ]
  }
}
```

---

### POST `/notes`
**Descrição**: Criar nova nota básica  
**Autenticação**: ✅ Token JWT obrigatório

#### Request
```json
{
  "title": "Título da nova nota",
  "content": "Conteúdo inicial (opcional)"
}
```

#### Response (201)
```json
{
  "success": true,
  "message": "Nota criada com sucesso",
  "data": {
    "id": "uuid",
    "title": "Título da nova nota",
    "content": "",
    "createdAt": "2025-09-21T10:00:00Z"
  }
}
```

---

### POST `/notes/complete`
**Descrição**: Criar nota completa com bloco inicial  
**Autenticação**: ✅ Token JWT obrigatório

#### Request
```json
{
  "title": "Título da nota",
  "content": "Conteúdo principal",
  "firstBlock": {
    "type": "text",
    "content": "Conteúdo do primeiro bloco"
  }
}
```

#### Response (201)
```json
{
  "success": true,
  "message": "Nota completa criada com sucesso",
  "data": {
    "note": { /* dados da nota */ },
    "firstBlock": { /* dados do bloco criado */ }
  }
}
```

---

### PUT `/notes/:id`
**Descrição**: Atualizar nota existente  
**Autenticação**: ✅ Token JWT obrigatório

#### Parameters
- `id`: ID da nota (UUID)

#### Request
```json
{
  "title": "Novo título",
  "content": "Novo conteúdo"
}
```

#### Response (200)
```json
{
  "success": true,
  "message": "Nota atualizada com sucesso",
  "data": { /* dados atualizados */ }
}
```

---

### DELETE `/notes/:id`
**Descrição**: Deletar nota e todos os blocos associados  
**Autenticação**: ✅ Token JWT obrigatório

#### Parameters
- `id`: ID da nota (UUID)

#### Response (200)
```json
{
  "success": true,
  "message": "Nota deletada com sucesso"
}
```

---

## 🧩 Blocos

> **Nota**: Todas as rotas de blocos requerem autenticação JWT

### GET `/notes/:noteId/blocks`
**Descrição**: Listar todos os blocos de uma nota  
**Autenticação**: ✅ Token JWT obrigatório

#### Parameters
- `noteId`: ID da nota (UUID)

#### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "noteId": "uuid",
      "type": "text",
      "content": "Conteúdo do bloco",
      "order": 1,
      "createdAt": "2025-09-21T10:00:00Z",
      "updatedAt": "2025-09-21T10:30:00Z"
    },
    {
      "id": "uuid",
      "noteId": "uuid",
      "type": "image",
      "content": "https://bucket.s3.amazonaws.com/image.jpg",
      "order": 2,
      "createdAt": "2025-09-21T10:15:00Z"
    }
  ]
}
```

---

### POST `/notes/:id/blocks`
**Descrição**: Criar novo bloco na nota  
**Autenticação**: ✅ Token JWT obrigatório

#### Parameters
- `id`: ID da nota (UUID)

#### Request
```json
{
  "type": "text|image|list|code",
  "content": "Conteúdo do bloco",
  "order": 3
}
```

#### Response (201)
```json
{
  "success": true,
  "message": "Bloco criado com sucesso",
  "data": {
    "id": "uuid",
    "noteId": "uuid",
    "type": "text",
    "content": "Conteúdo do bloco",
    "order": 3,
    "createdAt": "2025-09-21T10:00:00Z"
  }
}
```

---

### PUT `/notes/:noteId/blocks/:blockId`
**Descrição**: Atualizar bloco específico  
**Autenticação**: ✅ Token JWT obrigatório

#### Parameters
- `noteId`: ID da nota (UUID)
- `blockId`: ID do bloco (UUID)

#### Request
```json
{
  "type": "text",
  "content": "Conteúdo atualizado",
  "order": 2
}
```

#### Response (200)
```json
{
  "success": true,
  "message": "Bloco atualizado com sucesso",
  "data": { /* dados atualizados */ }
}
```

---

### DELETE `/notes/:noteId/blocks/:blockId`
**Descrição**: Deletar bloco específico  
**Autenticação**: ✅ Token JWT obrigatório

#### Parameters
- `noteId`: ID da nota (UUID)
- `blockId`: ID do bloco (UUID)

#### Response (200)
```json
{
  "success": true,
  "message": "Bloco deletado com sucesso"
}
```

---

### PUT `/notes/:noteId/blocks/reorder`
**Descrição**: Reordenar blocos da nota  
**Autenticação**: ✅ Token JWT obrigatório

#### Parameters
- `noteId`: ID da nota (UUID)

#### Request
```json
{
  "blocks": [
    {
      "id": "uuid",
      "order": 1
    },
    {
      "id": "uuid",
      "order": 2
    },
    {
      "id": "uuid",
      "order": 3
    }
  ]
}
```

#### Response (200)
```json
{
  "success": true,
  "message": "Blocos reordenados com sucesso",
  "data": { /* blocos com nova ordem */ }
}
```

---

## 🔑 Recuperação de Senha

### POST `/password/forgot-password`
**Descrição**: Solicitar reset de senha via email  
**Autenticação**: ❌ Não requerida

#### Request
```json
{
  "email": "user@example.com"
}
```

#### Validações
- `email`: Deve ser um email válido

#### Response (200)
```json
{
  "success": true,
  "message": "Email de recuperação enviado com sucesso"
}
```

---

### POST `/password/reset-password`
**Descrição**: Resetar senha usando token do email  
**Autenticação**: ❌ Não requerida

#### Request
```json
{
  "token": "reset_token_from_email",
  "newPassword": "nova_senha_123"
}
```

#### Response (200)
```json
{
  "success": true,
  "message": "Senha resetada com sucesso"
}
```

---

## Middlewares Globais

### Autenticação
- **verifyToken**: Verifica token JWT em rotas protegidas
- Header obrigatório: `Authorization: Bearer <token>`

### Segurança
- **CORS**: Controle de origem
- **Helmet**: Headers de segurança
- **Rate Limiting**: Limite de requisições

### Validação
- **express-validator**: Validação de dados de entrada
- **dataValidator**: Validação customizada
- **imageValidator**: Validação de imagens

### Rate Limiting
- **loginLimiter**: Aplicado em `/auth/signin`
- Limite padrão: 5 tentativas por 15 minutos

---

## Códigos de Status

| Código | Descrição |
|--------|-----------|
| 200    | Sucesso |
| 201    | Criado com sucesso |
| 400    | Requisição inválida |
| 401    | Não autenticado |
| 403    | Não autorizado |
| 404    | Não encontrado |
| 409    | Conflito (ex: email já existe) |
| 422    | Dados inválidos |
| 429    | Rate limit excedido |
| 500    | Erro interno do servidor |

---

## Headers Obrigatórios

### Para rotas autenticadas:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Para upload de arquivos:
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

### Para todas as requisições:
```
Accept: application/json
User-Agent: YourApp/1.0
```

---

## 📝 Notas Importantes

1. **Tokens JWT**: Expiram em 24h (configurável)
3. **Rate Limiting**: Aplicado globalmente e em rotas específicas
4. **CORS**: Configurado para permitir origens específicas
5. **Uploads**: Limitados a 2MB por arquivo

---

**Última atualização**: Setembro 2025  
**Versão da API**: 1.0.0