# Backup Controller - Documentação

## Funcionalidades

O backup controller permite que usuários exportem todos os seus dados de forma segura e organizada.

## Endpoints Disponíveis

### GET /api/backup/export
**Descrição**: Exporta todos os dados do usuário em formato JSON
**Autenticação**: Requerida (Token JWT)

**Resposta**:
```json
{
  "backup_info": {
    "generated_at": "2025-10-11T10:30:00.000Z",
    "total_notes": 15,
    "data_version": "1.0"
  },
  "notes": [
    {
      "id": "123",
      "title": "Minha Nota",
      "description": "Descrição da nota",
      "tags": ["tag1", "tag2"],
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-02T00:00:00.000Z",
      "owner": {
        "id": "456",
        "name": "Nome do Usuário",
        "username": "username",
        "avatar_url": "url_do_avatar"
      },
      "collaborators": [...],
      "blocks": [...]
    }
  ]
}
```

### GET /api/backup/summary
**Descrição**: Retorna estatísticas resumidas dos dados do usuário
**Autenticação**: Requerida (Token JWT)

**Resposta**:
```json
{
  "generated_at": "2025-10-11T10:30:00.000Z",
  "summary": {
    "total_notes": 15,
    "owned_notes": 12,
    "collaborated_notes": 3,
    "total_blocks": 145,
    "total_collaborators": 5,
    "oldest_note": "2024-01-01T00:00:00.000Z",
    "newest_note": "2025-10-11T00:00:00.000Z",
    "last_updated": "2025-10-11T09:30:00.000Z"
  },
  "notes_by_month": {
    "2024-11": 2,
    "2024-12": 3,
    "2025-01": 5,
    "2025-02": 1,
    ...
  },
  "recent_activity": {
    "notes_created": 3,
    "notes_updated": 8
  }
}
```

## Segurança

### Validações Implementadas:
- **Autenticação**: Verifica se o usuário está logado
- **Autorização**: Usuário só acessa seus próprios dados
- **Privacidade**: Remove emails dos colaboradores
- **Filtragem**: Remove blocos deletados

### Dados Incluídos:
- ✅ Notas próprias do usuário
- ✅ Notas onde o usuário é colaborador
- ✅ Blocos ativos (não deletados)
- ✅ Informações dos colaboradores (sem email)
- ✅ Metadados e timestamps

### Dados Excluídos por Segurança:
- ❌ Emails dos colaboradores
- ❌ Blocos deletados
- ❌ Dados de outros usuários não relacionados

## Uso Recomendado

O endpoint `/export` deve ser usado para:
- Backup completo dos dados
- Migração para outras plataformas
- Auditoria de dados pessoais

O endpoint `/summary` deve ser usado para:
- Dashboard de estatísticas
- Verificação rápida do volume de dados
- Análise de atividade do usuário