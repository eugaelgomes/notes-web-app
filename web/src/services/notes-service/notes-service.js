// services/notes-service.js
import { API_BASE_URL } from "../../config/api";

//
// --- Notes API ---
//

export async function fetchNotes() {
  const response = await fetch(`${API_BASE_URL}/notes`, {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Inclui cookies HttpOnly
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || 'Ops! Não conseguimos buscar suas notas.');
    } catch {
      throw new Error(errorText || 'Ops! Não conseguimos buscar suas notas.');
    }
  }

  const data = await response.json();
  return data.notes || [];
}

export async function fetchNoteById(noteId) {
  const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Inclui cookies HttpOnly
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || 'Nota não encontrada.');
    } catch {
      throw new Error(errorText || 'Nota não encontrada.');
    }
  }

  const data = await response.json();
  return data.data || data; // Retorna os dados da nota
}

export async function createNote(noteData) {
  const response = await fetch(`${API_BASE_URL}/notes`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Inclui cookies HttpOnly
    body: JSON.stringify({
      title: noteData.title,
      description: noteData.description,
      tags: noteData.tags || []
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || 'Ops! Não conseguimos criar sua nota.');
    } catch {
      throw new Error(errorText || 'Ops! Não conseguimos criar sua nota.');
    }
  }

  return await response.json();
}

export async function updateNote(noteId, noteData) {
  const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Inclui cookies HttpOnly
    body: JSON.stringify({
      title: noteData.title,
      description: noteData.description
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || 'Não foi possível atualizar a nota.');
    } catch {
      throw new Error(errorText || 'Não foi possível atualizar a nota.');
    }
  }

  return await response.json();
}

export async function deleteNote(noteId) {
  const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
    method: 'DELETE',
    headers: { 
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Inclui cookies HttpOnly
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || 'Erro ao deletar a nota.');
    } catch {
      throw new Error(errorText || 'Erro ao deletar a nota.');
    }
  }

  return true;
}

//
// --- Blocks API ---
//

export async function fetchBlocks(noteId) {
  const response = await fetch(`${API_BASE_URL}/notes/${noteId}/blocks`, {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Inclui cookies HttpOnly
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || 'Erro ao buscar blocos da nota.');
    } catch {
      throw new Error(errorText || 'Erro ao buscar blocos da nota.');
    }
  }

  const data = await response.json();
  return data.blocks || [];
}

export async function createBlock(noteId, blockData) {
  const response = await fetch(`${API_BASE_URL}/notes/${noteId}/blocks`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Inclui cookies HttpOnly
    body: JSON.stringify({
      type: blockData.type,
      text: blockData.text || '',
      properties: blockData.properties || {},
      done: blockData.done,
      parentId: blockData.parentId,
      position: blockData.position
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || 'Erro ao criar bloco.');
    } catch {
      throw new Error(errorText || 'Erro ao criar bloco.');
    }
  }

  return await response.json();
}

export async function updateBlock(noteId, blockId, blockData) {
  const response = await fetch(`${API_BASE_URL}/notes/${noteId}/blocks/${blockId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Inclui cookies HttpOnly
    body: JSON.stringify(blockData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || 'Erro ao atualizar bloco.');
    } catch {
      throw new Error(errorText || 'Erro ao atualizar bloco.');
    }
  }

  return await response.json();
}

export async function deleteBlock(noteId, blockId) {
  const response = await fetch(`${API_BASE_URL}/notes/${noteId}/blocks/${blockId}`, {
    method: 'DELETE',
    headers: { 
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Inclui cookies HttpOnly
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || 'Erro ao deletar bloco.');
    } catch {
      throw new Error(errorText || 'Erro ao deletar bloco.');
    }
  }

  return true;
}

export async function reorderBlocks(noteId, blockPositions) {
  const response = await fetch(`${API_BASE_URL}/notes/${noteId}/blocks/reorder`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Inclui cookies HttpOnly
    body: JSON.stringify({
      blocks: blockPositions
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || 'Erro ao reordenar blocos.');
    } catch {
      throw new Error(errorText || 'Erro ao reordenar blocos.');
    }
  }

  return true;
}