const { executeQuery, rowCount } = require("@/services/db/db-connection");

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

    -- criador da nota
    u.name AS user_name,
    u.username AS user_username,
    u.email AS user_email,
    u.avatar_url AS user_avatar_url,

    -- colaboradores em JSON
    COALESCE(
        json_agg(
            json_build_object(
                'id', c.user_id,
                'name', c.name,
                'username', c.username,
                'email', c.email,
                'avatar_url', c.avatar_url,
                'added_at', nc.added_at
            )
        ) FILTER (WHERE c.user_id IS NOT NULL), '[]'
    ) AS collaborators
    FROM notes n
    INNER JOIN users u ON n.user_id = u.user_id
    LEFT JOIN note_collaborators nc ON n.id = nc.note_id
    LEFT JOIN users c ON nc.user_id = c.user_id
    WHERE (n.user_id = $1 OR EXISTS (
        SELECT 1 FROM note_collaborators nc2 
        WHERE nc2.note_id = n.id AND nc2.user_id = $1
    ))
      AND n.deleted = false
    GROUP BY n.id, u.user_id
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

        -- criador da nota
        u.name as user_name,
        u.username as user_username,
        u.email as user_email,
        u.avatar_url as user_avatar_url,

        -- colaboradores em JSON
        COALESCE(
            json_agg(
                json_build_object(
                    'id', c.user_id,
                    'name', c.name,
                    'username', c.username,
                    'email', c.email,
                    'avatar_url', c.avatar_url,
                    'added_at', nc.added_at
                )
            ) FILTER (WHERE c.user_id IS NOT NULL), '[]'
        ) AS collaborators
      FROM notes n
      INNER JOIN users u ON n.user_id = u.user_id
      LEFT JOIN note_collaborators nc ON n.id = nc.note_id
      LEFT JOIN users c ON nc.user_id = c.user_id
      WHERE (n.user_id = $1 OR EXISTS (
          SELECT 1 FROM note_collaborators nc2 
          WHERE nc2.note_id = n.id AND nc2.user_id = $1
      ))
        AND n.deleted = false
      GROUP BY n.id, u.user_id
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
      sortOrder = "desc",
    } = options;

    // CÁLCULO DO OFFSET para paginação
    const offset = (page - 1) * limit;

    // CONSTRUÇÃO DINÂMICA DA QUERY
    let whereConditions = [
      "(n.user_id = $1 OR EXISTS (SELECT 1 FROM note_collaborators nc2 WHERE nc2.note_id = n.id AND nc2.user_id = $1))",
      "n.deleted = false",
    ];
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
    const validSortField = validSortFields.includes(sortBy)
      ? sortBy
      : "updated_at";
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

        -- criador da nota
        u.name as user_name,
        u.username as user_username,
        u.email as user_email,
        u.avatar_url as user_avatar_url,

        -- colaboradores em JSON
        COALESCE(
            json_agg(
                json_build_object(
                    'id', c.user_id,
                    'name', c.name,
                    'username', c.username,
                    'email', c.email,
                    'avatar_url', c.avatar_url,
                    'added_at', nc.added_at
                )
            ) FILTER (WHERE c.user_id IS NOT NULL), '[]'
        ) AS collaborators
      FROM notes n
      INNER JOIN users u ON n.user_id = u.user_id
      LEFT JOIN note_collaborators nc ON n.id = nc.note_id
      LEFT JOIN users c ON nc.user_id = c.user_id
      WHERE ${whereConditions.join(" AND ")}
      GROUP BY n.id, u.user_id
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
    const notes = await executeQuery(notesQuery, [
      ...queryParams,
      limit,
      offset,
    ]);
    const [countResult] = await executeQuery(countQuery, queryParams);
    const total = parseInt(countResult.total);

    // CÁLCULOS DE PAGINAÇÃO
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    console.log(
      `📊 Paginação: página ${page}/${totalPages}, ${notes.length} de ${total} notas`
    ); // Debug educativo

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
        hasMore: hasNextPage, // Para compatibilidade com scroll infinito
      },
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

        -- criador da nota
        u.name as user_name,
        u.username as user_username,
        u.email as user_email,
        u.avatar_url as user_avatar_url,

        -- colaboradores em JSON
        COALESCE(
            json_agg(
                json_build_object(
                    'id', c.user_id,
                    'username', c.username,
                    'avatar_url', c.avatar_url
                )
            ) FILTER (WHERE c.user_id IS NOT NULL), '[]'
        ) AS collaborators
      FROM notes n
      INNER JOIN users u ON n.user_id = u.user_id
      LEFT JOIN note_collaborators nc ON n.id = nc.note_id
      LEFT JOIN users c ON nc.user_id = c.user_id
      WHERE n.id = $1 AND n.deleted = false
      GROUP BY n.id, u.user_id
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

  async createCompleteNote(
    userId,
    title,
    description,
    tags = [],
    initialBlockContent = ""
  ) {
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
      initialBlockContent,
    ]);
    return results[0];
  }

  async deleteNoteById(noteId) {
    const query = "UPDATE notes SET deleted = true WHERE id = $1";
    await executeQuery(query, [noteId]);
  }

  // ========================================
  // MÉTODOS PARA GERENCIAR COLABORADORES
  // ========================================

  /**
   * Adiciona um colaborador à nota
   * @param {string} noteId - ID da nota
   * @param {string} userId - ID do usuário colaborador
   * @returns {Object} - Dados do colaborador adicionado
   */
  async addCollaborator(noteId, userId) {
    const query = `
      INSERT INTO note_collaborators (note_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (note_id, user_id) DO NOTHING
      RETURNING *;
    `;
    const results = await executeQuery(query, [noteId, userId]);
    return results[0];
  }

  /**
   * Remove um colaborador da nota
   * @param {string} noteId - ID da nota
   * @param {string} userId - ID do usuário colaborador
   */
  async removeCollaborator(noteId, userId) {
    const query = `
      UPDATE note_collaborators SET removed_at = NOW(), removed = true, removed_by = 'owner'
      WHERE note_id = $1 AND user_id = $2;
    `;
    await executeQuery(query, [noteId, userId]);
  }

  /**
   * Recusa a colaboração de um usuário em uma nota
   * @param {string} noteId - ID da nota
   * @param {string} userId - ID do usuário colaborador
   * @returns {Object} - Objeto com rowCount para checar operação
   */
  async recuseCollaboration(noteId, userId) {
    const query = `
    UPDATE note_collaborators
    SET removed_at = NOW(),
        removed = true,
        removed_by = 'itself'
    WHERE note_id = $1
      AND user_id = $2
      AND removed = false
      AND user_id <> (SELECT user_id FROM notes WHERE note_id = $1);
  `;
    const count = await rowCount(query, [noteId, userId]);
    return { rowCount: count };
  }

  /**
   * Lista todos os colaboradores de uma nota
   * @param {string} noteId - ID da nota
   * @returns {Array} - Lista de colaboradores
   */
  async getCollaboratorsByNoteId(noteId) {
    const query = `
    SELECT 
      nc.user_id::text,
      nc.added_at,
      u.username,
      u.email,
      u.avatar_url,
      nc.removed,
      nc.removed_by,
      nc.removed_at
    FROM note_collaborators nc
    INNER JOIN notes n ON nc.note_id = n.id
    INNER JOIN users u ON nc.user_id = u.user_id
    WHERE nc.note_id = $1
    ORDER BY nc.added_at ASC;
    `;
    return await executeQuery(query, [noteId]);
  }

  /**
   * Verifica se um usuário é colaborador de uma nota
   * @param {string} noteId - ID da nota
   * @param {string} userId - ID do usuário
   * @returns {boolean} - True se for colaborador
   */
  async isCollaborator(noteId, userId) {
    const query = `
      SELECT 1 FROM note_collaborators
      WHERE note_id = $1 AND user_id = $2 AND removed = false
      LIMIT 1;
    `;
    const results = await executeQuery(query, [noteId, userId]);
    return results.length > 0;
  }
}

module.exports = new notesRepository();
