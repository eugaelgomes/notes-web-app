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

  // =================== MÉTODO ORIGINAL (mantido para compatibilidade) ===================
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

  // =================== MÉTODO COM PAGINAÇÃO E FILTROS ===================
  /**
   * Busca notas com suporte a paginação, busca e filtros
   * @param {string} userId - ID do usuário
   * @param {Object} options - Opções de paginação e filtros
   * @param {number} options.page - Página atual (default: 1)
   * @param {number} options.limit - Itens por página (default: 10)
   * @param {string} options.search - Termo de busca (opcional)
   * @param {Array} options.tags - Tags para filtrar (opcional)
   * @param {string} options.sortBy - Campo de ordenação (default: "updated_at")
   * @param {string} options.sortOrder - Ordem: "asc" ou "desc" (default: "desc")
   * @returns {Object} - { notes: Array, pagination: Object }
   */
  async getAllNotesWithPagination(userId, options = {}) {
    const {
      page = 1,
      limit = 10,
      search = "",
      tags = [],
      sortBy = "updated_at",
      sortOrder = "desc"
    } = options;

    // CÁLCULO DO OFFSET para paginação
    const offset = (page - 1) * limit;
    
    // CONSTRUÇÃO DINÂMICA DA QUERY
    let whereConditions = ["n.user_id = $1", "n.deleted = false"];
    let queryParams = [userId];
    let paramIndex = 2; // Próximo índice de parâmetro

    // FILTRO DE BUSCA: procura no título e descrição
    if (search && search.trim()) {
      whereConditions.push(`(
        LOWER(n.title) LIKE LOWER($${paramIndex}) OR 
        LOWER(n.description) LIKE LOWER($${paramIndex})
      )`);
      queryParams.push(`%${search.trim()}%`);
      paramIndex++;
    }

    // FILTRO POR TAGS: procura se nota tem alguma das tags especificadas
    if (tags && tags.length > 0) {
      whereConditions.push(`n.tags && $${paramIndex}`); // Operador PostgreSQL para arrays
      queryParams.push(tags);
      paramIndex++;
    }

    // VALIDAÇÃO DE CAMPO DE ORDENAÇÃO (previne SQL injection)
    const validSortFields = ["updated_at", "created_at", "title"];
    const validSortField = validSortFields.includes(sortBy) ? sortBy : "updated_at";
    const validSortOrder = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";

    // QUERY PRINCIPAL para buscar notas
    const notesQuery = `
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
      WHERE ${whereConditions.join(" AND ")}
      ORDER BY n.${validSortField} ${validSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;

    // QUERY PARA CONTAR TOTAL (mesmas condições, sem LIMIT/OFFSET)
    const countQuery = `
      SELECT COUNT(*) as total
      FROM notes n
      WHERE ${whereConditions.join(" AND ")};
    `;

    // EXECUÇÃO DAS QUERIES
    const notes = await executeQuery(notesQuery, [...queryParams, limit, offset]);
    const [countResult] = await executeQuery(countQuery, queryParams);
    const total = parseInt(countResult.total);

    // CÁLCULOS DE PAGINAÇÃO
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    console.log(`📊 Paginação: página ${page}/${totalPages}, ${notes.length} de ${total} notas`); // Debug educativo

    // RETORNO PADRONIZADO
    return {
      notes,
      pagination: {
        currentPage: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
        hasMore: hasNextPage // Para compatibilidade com scroll infinito
      }
    };
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
    const query = "UPDATE notes SET deleted = true WHERE id = $1";
    await executeQuery(query, [noteId]);
  }
}

module.exports = new notesRepository();
