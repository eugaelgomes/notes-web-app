# Guia de Integração Frontend ↔ Backend

## ✅ Mudanças Implementadas

### 1. **Notes Service Expandido** (`NotesService.js`)
- ➕ Adicionadas funções para CRUD de blocos
- ➕ Função `createBlock()`, `updateBlock()`, `deleteBlock()`
- ➕ Função `reorderBlocks()` para reordenação
- ➕ Função `fetchBlocks()` para buscar blocos específicos

### 2. **Use Notes Provider Atualizado** (`UseNotesProvider.js`)
- ➕ Importadas novas funções de blocos
- ➕ Funções expostas no retorno do hook

### 3. **View Notes Componente** (`view-notes.jsx`)
- ➕ Suporte às propriedades dos blocos (`properties`)
- ➕ Configurações específicas por tipo de bloco:
  - **Heading**: Seletor de nível (H1-H6)
  - **Code**: Campo para linguagem
- ➕ Funções para converter entre estrutura hierárquica (API) e flat (frontend)
- ➕ Botão de remover bloco individual
- ➕ Preview melhorado com propriedades

## 🔄 Como a Integração Funciona Agora

### **Estrutura de Dados:**

**API Response (Hierárquica):**
```json
{
  "blocks": [
    {
      "id": "1",
      "type": "heading",
      "text": "Título Principal",
      "properties": { "level": 1 },
      "children": [
        {
          "id": "2", 
          "type": "paragraph",
          "text": "Parágrafo filho",
          "children": []
        }
      ]
    }
  ]
}
```

**Frontend Working Format (Flat):**
```json
{
  "blocks": [
    { "id": "1", "type": "heading", "text": "Título Principal", "properties": { "level": 1 }, "parent_id": null },
    { "id": "2", "type": "paragraph", "text": "Parágrafo filho", "parent_id": "1" }
  ]
}
```

### **Fluxo de Operações:**

1. **Carregar Nota:**
   - API retorna estrutura hierárquica
   - Frontend converte para flat (`flattenBlocks()`)
   - Usuário edita no formato flat

2. **Salvar Nota:**
   - Frontend reconstrói árvore (`buildBlockTree()`)
   - Cada bloco é salvo individualmente via API de blocos
   - API mantém hierarquia no banco

## 🚧 Próximos Passos Necessários

### 1. **Integrar com UseNotesProvider**
```javascript
// No componente ViewNotes, usar as funções do hook:
const { createBlock, updateBlock, deleteBlock } = useNotesProvider();

// Ao salvar, usar APIs específicas:
await createBlock(token, noteId, blockData);
await updateBlock(token, noteId, blockId, updateData);
```

### 2. **Implementar Salvamento Inteligente**
```javascript
const handleSave = async () => {
  // 1. Salvar nota básica (título, descrição, tags)
  await updateNote(noteId, { title, description, tags });
  
  // 2. Para cada bloco modificado:
  for (const block of modifiedBlocks) {
    if (block.isNew) {
      await createBlock(token, noteId, block);
    } else if (block.isModified) {
      await updateBlock(token, noteId, block.id, block);
    } else if (block.isDeleted) {
      await deleteBlock(token, noteId, block.id);
    }
  }
  
  // 3. Reordenar se necessário
  await reorderBlocks(token, noteId, blockPositions);
};
```

### 3. **Melhorar UX com Estados**
```javascript
const [blockStates, setBlockStates] = useState({
  saving: {},
  error: {},
  modified: {}
});

// Indicadores visuais para cada bloco:
// - 🔄 Salvando
// - ❌ Erro  
// - ✏️ Modificado
```

### 4. **Implementar Drag & Drop**
```javascript
// Para reordenação de blocos
const handleDragEnd = async (result) => {
  const newOrder = reorderArray(formData.blocks, result);
  setFormData(prev => ({ ...prev, blocks: newOrder }));
  
  // Salvar nova ordem na API
  const positions = newOrder.map((block, index) => ({
    id: block.id,
    position: index
  }));
  await reorderBlocks(token, noteId, positions);
};
```

## ⚡ Optimizações Recomendadas

### 1. **Cache Local**
- Implementar cache para evitar requests desnecessários
- Sincronização offline/online

### 2. **Debounce nas Edições**
- Salvar automaticamente após 2s de inatividade
- Evitar múltiplas chamadas à API

### 3. **Versionamento**
- Implementar controle de versão para conflitos
- Merge inteligente de alterações simultâneas

## 🎯 Status da Integração

- ✅ **Backend**: API completa e funcional
- ✅ **Frontend Services**: Funções implementadas  
- ✅ **UI Components**: Suporte básico implementado
- 🔄 **Integration**: Necessita conectar componentes às APIs
- ⏳ **Testing**: Pendente
- ⏳ **UX Polish**: Drag&drop, auto-save, etc.

A base está pronta! Agora é questão de conectar os pontos e polir a experiência do usuário. 🚀