# API Documentation - Sistema de Blocos para Notas

## 📋 Visão Geral

O sistema foi atualizado para suportar uma estrutura rica de blocos hierárquicos nas notas, substituindo o sistema anterior de "items" simples.

## 🏗️ Estrutura dos Blocos

### Tipos de Blocos Suportados:
- **text**: Texto simples
- **todo**: Lista de tarefas (com propriedade `done`)
- **list**: Lista com marcadores
- **page**: Página aninhada
- **heading**: Cabeçalho (com nível em `properties`)
- **paragraph**: Parágrafo
- **quote**: Citação
- **code**: Bloco de código (com linguagem em `properties`)

### Estrutura Hierárquica:
Os blocos podem ter blocos filhos através da propriedade `parent_id`, permitindo estruturas como:
- Cabeçalhos com parágrafos filhos
- Listas com sublistas
- Páginas com conteúdo aninhado

## 🔄 Mudanças na API

### Resposta das Notas (ANTES vs DEPOIS)

**ANTES** (com items):
```json
{
  "id": "123",
  "title": "Minha Nota",
  "description": "Descrição da nota",
  "tags": ["trabalho"],
  "items": [
    {
      "id": "item1",
      "type": "todo",
      "text": "Fazer algo",
      "done": false,
      "children": []
    }
  ]
}
```

**DEPOIS** (com blocks):
```json
{
  "id": "123",
  "title": "Minha Nota",
  "description": "Descrição da nota",
  "tags": ["trabalho"],
  "blocks": [
    {
      "id": "block1",
      "type": "heading",
      "text": "Introdução",
      "properties": {"level": 1},
      "position": 1,
      "children": [
        {
          "id": "block2",
          "type": "paragraph",
          "text": "Este é um parágrafo sob o cabeçalho.",
          "properties": {},
          "position": 1,
          "children": []
        }
      ]
    },
    {
      "id": "block3",
      "type": "todo",
      "text": "Tarefa importante",
      "done": false,
      "properties": {},
      "position": 2,
      "children": []
    }
  ]
}
```

## 🌐 Endpoints da API

### Notas (existentes - atualizados)
- `GET /api/notes` - Lista todas as notas (agora com blocos)
- `GET /api/notes/:id` - Busca nota específica (agora com blocos)
- `POST /api/notes` - Cria nova nota
- `PUT /api/notes/:id` - Atualiza nota
- `DELETE /api/notes/:id` - Deleta nota

### Blocos (novos endpoints)
- `GET /api/notes/:noteId/blocks` - Lista blocos de uma nota
- `POST /api/notes/:id/blocks` - Cria novo bloco
- `PUT /api/notes/:noteId/blocks/:blockId` - Atualiza bloco
- `DELETE /api/notes/:noteId/blocks/:blockId` - Deleta bloco
- `PUT /api/notes/:noteId/blocks/reorder` - Reordena blocos

## 📝 Exemplos de Uso

### 1. Criar um Bloco de Cabeçalho
```bash
POST /api/notes/123/blocks
Content-Type: application/json

{
  "type": "heading",
  "text": "Capítulo 1",
  "properties": {
    "level": 1
  }
}
```

### 2. Criar um Bloco de Código
```bash
POST /api/notes/123/blocks
Content-Type: application/json

{
  "type": "code",
  "text": "console.log('Hello World');",
  "properties": {
    "language": "javascript"
  }
}
```

### 3. Criar um Todo
```bash
POST /api/notes/123/blocks
Content-Type: application/json

{
  "type": "todo",
  "text": "Revisar documentação",
  "done": false
}
```

### 4. Criar um Bloco Filho
```bash
POST /api/notes/123/blocks
Content-Type: application/json

{
  "type": "paragraph",
  "text": "Este parágrafo está sob um cabeçalho",
  "parentId": "parent-block-id"
}
```

### 5. Atualizar um Bloco
```bash
PUT /api/notes/123/blocks/block-id
Content-Type: application/json

{
  "text": "Texto atualizado",
  "done": true
}
```

### 6. Reordenar Blocos
```bash
PUT /api/notes/123/blocks/reorder
Content-Type: application/json

{
  "blocks": [
    {"id": "block1", "position": 1},
    {"id": "block2", "position": 2},
    {"id": "block3", "position": 3}
  ]
}
```

## 🔧 Propriedades Especiais

### Para Cabeçalhos (`heading`):
```json
{
  "properties": {
    "level": 1  // 1-6 (H1-H6)
  }
}
```

### Para Código (`code`):
```json
{
  "properties": {
    "language": "javascript",
    "caption": "Exemplo de função"
  }
}
```

### Para Citações (`quote`):
```json
{
  "properties": {
    "author": "Albert Einstein",
    "source": "Teoria da Relatividade"
  }
}
```

## 🎯 Benefícios da Nova Estrutura

1. **Flexibilidade**: Suporte a diversos tipos de conteúdo
2. **Hierarquia**: Estrutura aninhada de blocos
3. **Extensibilidade**: Campo `properties` permite personalização
4. **Performance**: Consultas otimizadas com CTE recursivo
5. **Organização**: Sistema de posicionamento para ordenação
6. **Escalabilidade**: Estrutura preparada para futuras expansões

## ⚠️ Considerações de Migração

- A estrutura anterior de `items` foi substituída por `blocks`
- O frontend precisará ser atualizado para consumir a nova estrutura
- As validações foram reforçadas para garantir integridade dos dados
- Sistema de soft delete mantém histórico dos blocos