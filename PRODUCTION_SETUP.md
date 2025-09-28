# 🔧 Configuração para Produção - Cookies HttpOnly

## 📋 Problemas Identificados

1. **"Acesso negado. Token não fornecido"** - Cookies não chegam ao servidor
2. **Sessão perdida ao recarregar** - Configuração inadequada de cookies cross-origin

## 🔑 Variáveis de Ambiente Necessárias

Configure estas variáveis no seu ambiente de produção:

### Backend (.env ou variáveis do sistema)

```bash
# Ambiente
NODE_ENV=production

# CORS - Domínios permitidos (separados por vírgula)
ALLOWED_ORIGINS=https://seudominio.com,https://www.seudominio.com

# Cookies - Domain para produção (opcional, para subdominios)
COOKIE_DOMAIN=.seudominio.com

# JWT Secret
SECRET_KEY_VARIABLE=sua-chave-secreta-super-forte

# Outras variáveis necessárias...
```

### Frontend (variáveis de build)

```bash
# URL da API em produção
VITE_API_URL=https://api.seudominio.com
```

## 🐛 Debug em Produção

Para identificar problemas, os logs agora mostram:

```
🔐 [Auth] Verificando autenticação...
🔐 [Auth] Headers: {...}
🔐 [Auth] Cookies recebidos: [...]
🌐 [CORS] Verificando origem: https://...
```

## ✅ Checklist de Correções Implementadas

- [x] **Cookies configurados para cross-origin**: `sameSite: "none"` + `secure: true`
- [x] **Domain configurável**: Usa `COOKIE_DOMAIN` em produção
- [x] **CORS atualizado**: Headers `Cookie` e `Set-Cookie` permitidos
- [x] **Auto-refresh implementado**: Cliente API detecta 401 e renova automaticamente
- [x] **Logs detalhados**: Para debug em produção
- [x] **Fallback de compatibilidade**: Ainda aceita Authorization headers

## 🚀 Próximos Passos

1. **Configure as variáveis de ambiente** no seu servidor
2. **Verifique HTTPS**: Cookies `secure` só funcionam com SSL
3. **Teste os logs**: Monitore console para ver se cookies chegam
4. **Valide CORS**: Confirme se origem está na lista permitida

## 🔒 Segurança Implementada

- ✅ **HttpOnly cookies** - Não acessíveis via JavaScript
- ✅ **Secure flag** - Apenas HTTPS em produção  
- ✅ **SameSite None** - Permite cross-origin
- ✅ **Auto-refresh** - Mantém sessão sem expor tokens
- ✅ **CORS restrito** - Apenas origens confiáveis

## 🛠️ Exemplo de Configuração Digital Ocean App Platform

```yaml
envs:
  - key: NODE_ENV
    value: production
  - key: ALLOWED_ORIGINS
    value: https://seuapp.ondigitalocean.app
  - key: COOKIE_DOMAIN
    value: ondigitalocean.app
  - key: SECRET_KEY_VARIABLE
    value: sua-chave-secreta
```

O sistema agora deve funcionar corretamente em produção com cookies HttpOnly seguros! 🎉