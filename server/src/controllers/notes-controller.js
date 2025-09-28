const notesRepository = require("@/repositories/notes-repo");
const blocksRepository = require("@/repositories/blocks-repo");

class NotesController {
  constructor() {
    this.notesRepository = notesRepository;
    this.blocksRepository = blocksRepository;
  }

  // ========================================
  // MÉTODOS UTILITÁRIOS E VALIDAÇÃO
  // ========================================

  /**
   * Valida se o usuário está autenticado
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object|null} - Retorna o userId se válido, ou envia erro HTTP
   */
  _validateAuthentication(req, res) {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "Usuário não autenticado" });
      return null;
    }

    return userId;
  }

  /**
   * Valida e verifica propriedade da nota
   * @param {string} noteId - ID da nota
   * @param {string} userId - ID do usuário
   * @returns {Object} - Nota encontrada
   * @throws {Error} - Se nota não existir ou não pertencer ao usuário
   */
  async _validateNoteOwnership(noteId, userId) {
    if (!noteId) {
      throw new Error("ID da nota é obrigatório");
    }

    const note = await this.notesRepository.getNoteById(noteId);

    if (!note) {
      throw new Error("Nota não encontrada");
    }

    if (note.user_id !== userId) {
      throw new Error("Acesso negado");
    }

    return note;
  }

  /**
   * Formata a resposta padrão de uma nota
   * @param {Object} note - Dados da nota do banco
   * @param {Array} blocks - Blocos da nota (opcional)
   * @returns {Object} - Nota formatada
   */
  _formatNoteResponse(note, blocks = []) {
    return {
      id: note.id.toString(),
      title: note.title,
      description: note.description,
      tags: note.tags || [],
      created_at: note.created_at,
      updated_at: note.updated_at,
      blocks: blocks, // Nova estrutura de blocos hierárquicos
    };
  }

  /**
   * Trata erros específicos e retorna resposta HTTP apropriada
   * @param {Error} error - Erro capturado
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  _handleError(error, res, next) {
    const errorMessage = error.message;

    // Erros de validação (400 Bad Request)
    if (errorMessage.includes("obrigatório")) {
      return res.status(400).json({ error: errorMessage });
    }

    // Erros de autorização e não encontrado (404 Not Found)
    if (
      errorMessage.includes("não encontrada") ||
      errorMessage.includes("Acesso negado")
    ) {
      return res.status(404).json({ error: errorMessage });
    }

    // Outros erros passam para o middleware de erro global
    next(error);
  }

  // ========================================
  // ENDPOINTS DA API
  // ========================================

  /**
   * GET /api/notes - Buscar todas as notas do usuário
   * Lista todas as notas pertencentes ao usuário autenticado
   */
  async getAllNotes(req, res, next) {
    try {
      // Validação de autenticação
      const userId = this._validateAuthentication(req, res);
      if (!userId) return;

      // Busca todas as notas do usuário
      const notes = await this.notesRepository.getAllNotesFormatted(userId);

      // Para cada nota, buscar seus blocos e montar estrutura completa
      const notesWithBlocks = await Promise.all(
        notes.map(async (note) => {
          const blocks = await this.blocksRepository.getBlocksByNoteId(note.id);
          const blockTree = this.blocksRepository.buildBlockTree(blocks);

          return {
              id: note.id,
              title: note.title,
              description: note.description,
              tags: note.tags || [],
              created_at: note.created_at,
              updated_at: note.updated_at,
              deleted: note.deleted,
              author: {
                id: note.user_id,
                username: note.user_username,
                avatar_url: note.user_avatar_url,
              },
              blocks: blockTree,
            };
        })
      );

      // Retorna resultado formatado
      res.status(200).json({ notes: notesWithBlocks });
    } catch (error) {
      this._handleError(error, res, next);
    }
  }

  /**
   * GET /api/notes/:id - Buscar uma nota específica
   * Retorna os detalhes de uma nota específica se pertencer ao usuário
   */
  async getNoteById(req, res, next) {
    try {
      const { id } = req.params;

      // Validação de autenticação
      const userId = this._validateAuthentication(req, res);
      if (!userId) return;

      // Validação de propriedade da nota
      const note = await this._validateNoteOwnership(id, userId);

      // Buscar blocos da nota
      const blocks = await this.blocksRepository.getBlocksByNoteId(id);
      const blockTree = this.blocksRepository.buildBlockTree(blocks);

      // Montar estrutura completa da nota
      const completeNote = {
        id: note.id,
        user_id: note.user_id,
        title: note.title,
        description: note.description,
        tags: note.tags || [],
        created_at: note.created_at,
        updated_at: note.updated_at,
        user: {
          id: note.user_id,
          name: note.user_name,
          username: note.user_username,
          email: note.user_email,
          avatar_url: note.user_avatar_url,
        },
        blocks: blockTree,
      };

      // Retorna a nota completa
      res.status(200).json(completeNote);
    } catch (error) {
      this._handleError(error, res, next);
    }
  }

  /**
   * POST /api/notes - Criar uma nova nota
   * Cria uma nova nota para o usuário autenticado
   */
  async createNote(req, res, next) {
    try {
      const { title, description, tags = [] } = req.body;

      // Validação de autenticação
      const userId = this._validateAuthentication(req, res);
      if (!userId) return;

      // Validação de dados obrigatórios
      if (!title) {
        throw new Error("Título é obrigatório");
      }

      // Criação da nota
      const newNote = await this.notesRepository.createNotesQuerie(
        userId,
        title,
        description,
        tags
      );

      // Formata e retorna a nota criada
      const formattedNote = this._formatNoteResponse(newNote);
      res.status(201).json(formattedNote);
    } catch (error) {
      this._handleError(error, res, next);
    }
  }

  /**
   * POST /api/notes/complete - Criar uma nota completa
   * Cria uma nova nota com bloco inicial para o usuário autenticado
   */
  async createCompleteNote(req, res, next) {
    try {
      const { title, description, tags = [], initialBlockContent = "" } = req.body;

      // Validação de autenticação
      const userId = this._validateAuthentication(req, res);
      if (!userId) return;

      // Validação de dados obrigatórios
      if (!title) {
        throw new Error("Título é obrigatório");
      }

      // Criação da nota completa (nota + bloco inicial) em uma única transação
      const result = await this.notesRepository.createCompleteNote(
        userId,
        title,
        description,
        tags,
        initialBlockContent
      );

      // Montar estrutura completa da nota com todos os dados das tabelas relacionadas
      const completeNote = {
        id: result.note_id,
        user_id: result.user_id,
        title: result.title,
        description: result.description,
        tags: result.tags || [],
        created_at: result.note_created_at,
        updated_at: result.note_updated_at,
        user: {
          id: result.user_id,
          name: result.user_name,
          username: result.user_username,
          email: result.user_email,
          avatar_url: result.user_avatar_url
        },
        blocks: [{
          id: result.block_id,
          note_id: result.note_id,
          user_id: result.user_id,
          parent_id: null,
          type: result.block_type,
          text: result.block_text,
          properties: result.block_properties,
          done: result.block_done,
          position: result.block_position,
          level: 0,
          created_at: result.block_created_at,
          updated_at: result.block_updated_at,
          children: []
        }]
      };

      // Retorna a nota completíssima criada
      res.status(201).json(completeNote);

    } catch (error) {
      this._handleError(error, res, next);
    }
  }

  /**
   * PUT /api/notes/:id - Atualizar uma nota
   * Atualiza título e descrição de uma nota existente
   */
  async updateNote(req, res, next) {
    try {
      const { id } = req.params;
      const { title, description } = req.body;

      // Validação de autenticação
      const userId = this._validateAuthentication(req, res);
      if (!userId) return;

      // Validação de propriedade da nota
      await this._validateNoteOwnership(id, userId);

      // Atualização da nota
      const updatedNote = await this.notesRepository.updateNoteById(
        id,
        title,
        description
      );

      // Formata e retorna a nota atualizada
      const formattedNote = this._formatNoteResponse(updatedNote);
      res.status(200).json(formattedNote);
    } catch (error) {
      this._handleError(error, res, next);
    }
  }

  /**
   * DELETE /api/notes/:id - Deletar uma nota
   * Remove uma nota e todos os seus itens associados
   */
  async deleteNote(req, res, next) {
    try {
      const { id } = req.params;

      // Validação de autenticação
      const userId = this._validateAuthentication(req, res);
      if (!userId) return;

      // Validação de propriedade da nota
      await this._validateNoteOwnership(id, userId);

      // Exclusão da nota
      await this.notesRepository.deleteNoteById(id);

      // Confirmação de exclusão
      res.status(200).json({
        message: "Nota deletada com sucesso",
      });
    } catch (error) {
      this._handleError(error, res, next);
    }
  }

  // ========================================
  // ENDPOINTS PARA GERENCIAMENTO DE BLOCOS
  // ========================================

  /**
   * POST /api/notes/:id/blocks - Criar um novo bloco
   * Adiciona um novo bloco à nota especificada
   */
  async createBlock(req, res, next) {
    try {
      const { id: noteId } = req.params;
      const { type, text, properties, done, parentId, position } = req.body;

      // Validação de autenticação
      const userId = this._validateAuthentication(req, res);
      if (!userId) return;

      // Verificar se a nota existe e pertence ao usuário
      await this._validateNoteOwnership(noteId, userId);

      // Validação de dados obrigatórios
      if (!type) {
        throw new Error("Tipo do bloco é obrigatório");
      }

      // Validar tipos permitidos
      const validTypes = [
        "text",
        "todo",
        "list",
        "page",
        "heading",
        "paragraph",
        "quote",
        "code",
      ];
      if (!validTypes.includes(type)) {
        throw new Error(
          `Tipo inválido. Tipos permitidos: ${validTypes.join(", ")}`
        );
      }

      // Criar o bloco
      const newBlock = await this.blocksRepository.createBlock({
        noteId,
        userId,
        parentId,
        type,
        text,
        properties: properties || {},
        done: type === "todo" ? done : undefined,
        position,
      });

      res.status(201).json(newBlock);
    } catch (error) {
      this._handleError(error, res, next);
    }
  }

  /**
   * PUT /api/notes/:noteId/blocks/:blockId - Atualizar um bloco
   * Atualiza um bloco existente da nota
   */
  async updateBlock(req, res, next) {
    try {
      const { noteId, blockId } = req.params;
      const updateData = req.body;

      // Validação de autenticação
      const userId = this._validateAuthentication(req, res);
      if (!userId) return;

      // Verificar se a nota existe e pertence ao usuário
      await this._validateNoteOwnership(noteId, userId);

      // Verificar se o bloco existe e pertence à nota
      const existingBlock = await this.blocksRepository.getBlockById(blockId);
      if (!existingBlock || existingBlock.note_id !== noteId) {
        throw new Error("Bloco não encontrado ou não pertence a esta nota");
      }

      // Atualizar o bloco
      const updatedBlock = await this.blocksRepository.updateBlock(
        blockId,
        updateData
      );

      res.status(200).json(updatedBlock);
    } catch (error) {
      this._handleError(error, res, next);
    }
  }

  /**
   * DELETE /api/notes/:noteId/blocks/:blockId - Deletar um bloco
   * Remove um bloco da nota (soft delete)
   */
  async deleteBlock(req, res, next) {
    try {
      const { noteId, blockId } = req.params;

      // Validação de autenticação
      const userId = this._validateAuthentication(req, res);
      if (!userId) return;

      // Verificar se a nota existe e pertence ao usuário
      await this._validateNoteOwnership(noteId, userId);

      // Verificar se o bloco existe e pertence à nota
      const existingBlock = await this.blocksRepository.getBlockById(blockId);
      if (!existingBlock || existingBlock.note_id !== noteId) {
        throw new Error("Bloco não encontrado ou não pertence a esta nota");
      }

      // Deletar o bloco
      await this.blocksRepository.deleteBlock(blockId);

      res.status(200).json({
        message: "Bloco deletado com sucesso",
      });
    } catch (error) {
      this._handleError(error, res, next);
    }
  }

  /**
   * PUT /api/notes/:noteId/blocks/reorder - Reordenar blocos
   * Atualiza as posições de múltiplos blocos
   */
  async reorderBlocks(req, res, next) {
    try {
      const { noteId } = req.params;
      const { blocks: blockPositions } = req.body;

      // Validação de autenticação
      const userId = this._validateAuthentication(req, res);
      if (!userId) return;

      // Verificar se a nota existe e pertence ao usuário
      await this._validateNoteOwnership(noteId, userId);

      // Validação dos dados
      if (!Array.isArray(blockPositions) || blockPositions.length === 0) {
        throw new Error("Lista de blocos é obrigatória");
      }

      // Validar formato dos dados
      for (const block of blockPositions) {
        if (!block.id || typeof block.position !== "number") {
          throw new Error("Cada bloco deve ter 'id' e 'position'");
        }
      }

      // Reordenar blocos
      await this.blocksRepository.reorderBlocks(blockPositions);

      res.status(200).json({
        message: "Blocos reordenados com sucesso",
      });
    } catch (error) {
      this._handleError(error, res, next);
    }
  }

  /**
   * GET /api/notes/:noteId/blocks - Buscar blocos de uma nota
   * Retorna todos os blocos organizados hierarquicamente
   */
  async getBlocksByNote(req, res, next) {
    try {
      const { noteId } = req.params;

      // Validação de autenticação
      const userId = this._validateAuthentication(req, res);
      if (!userId) return;

      // Verificar se a nota existe e pertence ao usuário
      await this._validateNoteOwnership(noteId, userId);

      // Buscar blocos da nota
      const blocks = await this.blocksRepository.getBlocksByNoteId(noteId);
      const blockTree = this.blocksRepository.buildBlockTree(blocks);

      res.status(200).json({
        blocks: blockTree,
      });
    } catch (error) {
      this._handleError(error, res, next);
    }
  }
}

module.exports = new NotesController();
