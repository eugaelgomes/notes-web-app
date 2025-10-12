# Backup Controller - Documentação

## Funcionalidades

O backup controller permite que usuários solicitem a exportação de todos os seus dados de forma **assíncrona e segura**. O processo é executado em background e o usuário recebe o backup por email.

## ⚡ **Sistema Assíncrono**

- ✅ **Não bloqueia o servidor**: Backup executado em background
- ✅ **Evita timeout**: Jobs com limite de 5 minutos
- ✅ **Entrega por email**: Arquivo enviado automaticamente
- ✅ **Proteção contra sobrecarga**: Limites de dados e rate limiting
- ✅ **Monitoramento**: Status e progresso em tempo real

## Endpoints Disponíveis

### POST /api/backup/request
**Descrição**: Solicita um backup assíncrono dos dados do usuário
**Autenticação**: Requerida (Token JWT)

**Resposta**:
```json
{
  "message": "Backup solicitado com sucesso! Você receberá um email quando estiver pronto.",
  "job_id": "backup_1728634200000_abc123",
  "status": "pending",
  "estimated_time": "2-5 minutos",
  "user_email": "usuario@email.com",
  "created_at": "2025-10-11T10:30:00.000Z"
}
```

**Códigos de Status**:
- `202`: Backup solicitado com sucesso
- `409`: Backup já em andamento
- `413`: Muitos dados (usuário deve contatar suporte)

### GET /api/backup/status/:jobId
**Descrição**: Verifica o status de um job de backup específico
**Autenticação**: Requerida (Token JWT)

**Resposta**:
```json
{
  "job_id": "backup_1728634200000_abc123",
  "status": "processing",
  "progress": 75,
  "created_at": "2025-10-11T10:30:00.000Z",
  "started_at": "2025-10-11T10:30:05.000Z",
  "completed_at": null,
  "elapsed_time": "3 minutos",
  "error": null,
  "result": null
}
```

**Status Possíveis**:
- `pending`: Aguardando processamento
- `processing`: Em execução
- `completed`: Concluído com sucesso
- `failed`: Falhou (ver campo error)

### GET /api/backup/jobs
**Descrição**: Lista os últimos 10 jobs de backup do usuário
**Autenticação**: Requerida (Token JWT)

**Resposta**:
```json
{
  "total": 3,
  "jobs": [
    {
      "job_id": "backup_1728634200000_abc123",
      "status": "completed",
      "progress": 100,
      "created_at": "2025-10-11T10:30:00.000Z",
      "completed_at": "2025-10-11T10:33:45.000Z",
      "error": null,
      "result": {
        "totalNotes": 25,
        "fileSize": 1048576
      }
    }
  ]
}
```

### GET /api/backup/summary
**Descrição**: Retorna estatísticas resumidas dos dados do usuário
**Autenticação**: Requerida (Token JWT)

**Resposta**: (Mesma do sistema anterior)

## 🔒 Segurança e Proteções

### Validações Implementadas:
- **Autenticação**: Verifica se o usuário está logado
- **Rate Limiting**: 1 backup por usuário de cada vez
- **Validação de ID**: Previne SQL injection
- **Timeout**: Jobs limitados a 5 minutos
- **Limite de dados**: Máximo 10.000 notas ou 100.000 blocos

### Proteções contra Sobrecarga:
- **Job assíncrono**: Não bloqueia outras requisições
- **Timeout automático**: Cancela jobs que demoram muito
- **Cleanup automático**: Remove jobs antigos a cada 6 horas
- **Limite de arquivo**: Máximo 25MB por email

### Dados Incluídos/Excluídos:
- ✅ Notas próprias do usuário
- ✅ Notas onde o usuário é colaborador
- ✅ Blocos ativos (não deletados)
- ✅ Informações dos colaboradores (sem email)
- ❌ Emails dos colaboradores (privacidade)
- ❌ Blocos deletados
- ❌ Dados de outros usuários

## 📧 Email de Entrega

Quando o backup estiver pronto, o usuário recebe um email com:
- **Arquivo anexado**: Se menor que 25MB
- **Informações do backup**: Total de notas, tamanho, data
- **Formato JSON**: Para fácil importação
- **Template responsivo**: HTML + texto simples

## 🚀 Fluxo de Uso Recomendado

1. **Solicitar backup**: `POST /api/backup/request`
2. **Monitorar progresso**: `GET /api/backup/status/:jobId`
3. **Aguardar email**: Receber arquivo automaticamente
4. **Verificar histórico**: `GET /api/backup/jobs`

## ⚠️ Limitações

- **1 backup simultâneo** por usuário
- **5 minutos máximo** por processamento
- **25MB máximo** para anexo de email
- **10.000 notas máximo** por backup
- **100.000 blocos máximo** por backup

## 🛠️ Monitoramento e Logs

O sistema registra automaticamente:
- Início e fim de cada job
- Erros e timeouts
- Tamanho dos arquivos gerados
- Tempo de processamento
- Limpeza de jobs antigos