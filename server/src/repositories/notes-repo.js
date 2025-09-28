const { executeQuery } = require("@/services/db/db-connection");

class notesRepository {
  // criar notas
  async createNotesQuerie(userId, title, content, tags = []) {
    const query = `
      INSERT INTO notes (user_id, title, description, tags)
      VALUES ($1, $2, $3, $4)
      RETURNING *; 
    `;
    const results = await executeQuery(query, [
      userId,
      title,
      content,
      tags, // PostgreSQL aceita arrays diretamente
    ]);
    return results[0];
  }

  async getAllNotesByUserId(userId) {
    const query = `
      SELECT 
        n.id::text,
        n.user_id::text,
        n.title,
        n.description,
        n.tags,
        n.created_at,
        n.updated_at,
        u.name as user_name,
        u.username as user_username,
        u.email as user_email,
        u.avatar_url as user_avatar_url
      FROM notes n
      INNER JOIN users u ON n.user_id = u.user_id
      WHERE n.user_id = $1 AND n.deleted = false
      ORDER BY n.updated_at DESC;
    `;
    return await executeQuery(query, [userId]);
  }

  async getAllNotesFormatted(userId) {
    const query = `
      SELECT 
        n.id::text,
        n.user_id::text,
        n.title,
        n.description,
        n.tags,
        n.created_at,
        n.updated_at,
        n.deleted,
        u.name as user_name,
        u.username as user_username,
        u.email as user_email,
        u.avatar_url as user_avatar_url
      FROM notes n
      INNER JOIN users u ON n.user_id = u.user_id
      WHERE n.user_id = $1 AND n.deleted = false
      ORDER BY n.updated_at DESC;
    `;
    return await executeQuery(query, [userId]);
  }

  async getNoteById(noteId) {
    const query = `
      SELECT 
        n.id::text,
        n.user_id::text,
        n.title,
        n.description,
        n.tags,
        n.created_at,
        n.updated_at,
        u.name as user_name,
        u.username as user_username,
        u.email as user_email,
        u.avatar_url as user_avatar_url
      FROM notes n
      INNER JOIN users u ON n.user_id = u.user_id
      WHERE n.id = $1 AND n.deleted = false
      LIMIT 1
    `;
    const results = await executeQuery(query, [noteId]);
    return results[0] || null;
  }

  async updateNoteById(noteId, title, content) {
    const query = `
      UPDATE notes
      SET title = $1, description = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *;
    `;
    const results = await executeQuery(query, [title, content, noteId]);
    return results[0];
  }

  async createCompleteNote(userId, title, description, tags = [], initialBlockContent = "") {
    const query = `
      WITH new_note AS (
        INSERT INTO notes (user_id, title, description, tags)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      ),
      new_block AS (
        INSERT INTO blocks (note_id, user_id, text)
        SELECT id, $1, $5
        FROM new_note
        RETURNING *
      )
      SELECT 
        -- Seleciona colunas da nota criada
        new_note.id AS note_id,
        new_note.title,
        new_note.created_at,
        
        -- Seleciona colunas do bloco criado
        new_block.id AS block_id,
        new_block.text
      FROM new_note, new_block;
    `;
    const results = await executeQuery(query, [
      userId,
      title,
      description,
      tags,
      initialBlockContent
    ]);
    return results[0];
  }

  async deleteNoteById(noteId) {
    const query = `UPDATE notes SET deleted = true WHERE id = $1`;
    await executeQuery(query, [noteId]);
  }
}

module.exports = new notesRepository();
