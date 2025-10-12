const getAllDataRepository = require("@/repositories/get-all-data");

class BackupController {
  constructor() {
    this.getAllDataRepository = getAllDataRepository;
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

  /**
   * Formata os dados de backup removendo informações sensíveis
   * @param {Array} rawData - Dados brutos do banco
   * @returns {Object} - Dados formatados para backup
   */
  _formatBackupData(rawData) {
    const backupData = {
      backup_info: {
        generated_at: new Date().toISOString(),
        total_notes: rawData.length,
        data_version: "1.0"
      },
      user_info: {
        user_id: rawData[0]?.owner_id || null,
        name: rawData[0]?.owner?.name || null,
        username: rawData[0]?.owner?.username || null,
        avatar_url: rawData[0]?.owner?.avatar_url || null
        // email removido por segurança
      },
      notes: rawData.map(note => {
        // Remove informações sensíveis dos colaboradores (emails)
        const collaborators = note.collaborators?.map(collab => ({
          id: collab.collaborator_id,
          name: collab.name,
          username: collab.username,
          avatar_url: collab.avatar_url,
          added_at: collab.added_at,
          removed: collab.removed,
          removed_at: collab.removed_at
          // email removido por segurança
        })) || [];

        // Remove informações sensíveis do proprietário (email)
        const owner = {
          id: note.owner_id,
          name: note.owner?.name,
          username: note.owner?.username,
          avatar_url: note.owner?.avatar_url
          // email removido por segurança
        };

        // Filtrar blocos não deletados
        const activeBlocks = note.blocks?.filter(block => !block.deleted) || [];

        return {
          id: note.note_id,
          title: note.title,
          description: note.description,
          tags: note.tags || [],
          created_at: note.created_at,
          updated_at: note.updated_at,
          owner: owner,
          collaborators: collaborators,
          blocks: activeBlocks.map(block => ({
            id: block.block_id,
            user_id: block.user_id,
            parent_id: block.parent_id,
            type: block.type,
            text: block.text,
            properties: block.properties,
            done: block.done,
            position: block.position,
            created_at: block.created_at,
            updated_at: block.updated_at
          }))
        };
      })
    };

    return backupData;
  }

  // ========================================
  // ENDPOINTS DA API
  // ========================================

  /**
   * GET /api/backup/export - Exportar todos os dados do usuário
   * Retorna um backup completo de todas as notas, blocos e colaborações do usuário
   * 
   * RESPOSTA:
   * - backup_info: metadados do backup (data de geração, total de notas, versão)
   * - notes: array com todas as notas do usuário (próprias e colaborações)
   *   - Para cada nota: dados básicos, proprietário, colaboradores e blocos
   * 
   * SEGURANÇA:
   * - Apenas dados que o usuário tem acesso (notas próprias + colaborações)
   * - Emails dos colaboradores são removidos por privacidade
   * - Blocos deletados são filtrados
   */
  async exportUserData(req, res, next) {
    try {
      // Validação de autenticação
      const userId = this._validateAuthentication(req, res);
      if (!userId) return;

      // Buscar todos os dados do usuário
      const rawData = await this.getAllDataRepository.getAllData(userId);

      // Formatação e limpeza dos dados
      const backupData = this._formatBackupData(rawData);

      // Adicionar cabeçalhos para download
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="notes-backup-${userId}-${Date.now()}.json"`);
      
      // Retornar dados de backup
      res.status(200).json(backupData);
    } catch (error) {
      this._handleError(error, res, next);
    }
  }

  /**
   * GET /api/backup/summary - Resumo dos dados para backup
   * Retorna informações estatísticas sobre os dados do usuário
   * 
   * RESPOSTA:
   * - summary: estatísticas gerais (total de notas, blocos, colaborações)
   * - notes_by_month: distribuição de notas por mês
   * - recent_activity: atividade recente
   */
  async getBackupSummary(req, res, next) {
    try {
      // Validação de autenticação
      const userId = this._validateAuthentication(req, res);
      if (!userId) return;

      // Buscar todos os dados do usuário
      const rawData = await this.getAllDataRepository.getAllData(userId);

      // Calcular estatísticas
      const summary = {
        total_notes: rawData.length,
        owned_notes: rawData.filter(note => note.owner_id === userId).length,
        collaborated_notes: rawData.filter(note => note.owner_id !== userId).length,
        total_blocks: rawData.reduce((sum, note) => sum + (note.blocks?.filter(b => !b.deleted).length || 0), 0),
        total_collaborators: new Set(
          rawData.flatMap(note => 
            note.collaborators?.filter(c => !c.removed).map(c => c.collaborator_id) || []
          )
        ).size,
        oldest_note: rawData.length > 0 ? Math.min(...rawData.map(n => new Date(n.created_at))) : null,
        newest_note: rawData.length > 0 ? Math.max(...rawData.map(n => new Date(n.created_at))) : null,
        last_updated: rawData.length > 0 ? Math.max(...rawData.map(n => new Date(n.updated_at))) : null
      };

      // Distribuição por mês (últimos 12 meses)
      const notesByMonth = {};
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        notesByMonth[key] = 0;
      }

      rawData.forEach(note => {
        const createdDate = new Date(note.created_at);
        const key = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, "0")}`;
        if (notesByMonth.hasOwnProperty(key)) {
          notesByMonth[key]++;
        }
      });

      // Atividade recente (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentActivity = {
        notes_created: rawData.filter(note => new Date(note.created_at) > thirtyDaysAgo).length,
        notes_updated: rawData.filter(note => new Date(note.updated_at) > thirtyDaysAgo).length
      };

      const response = {
        generated_at: new Date().toISOString(),
        summary,
        notes_by_month: notesByMonth,
        recent_activity: recentActivity
      };

      res.status(200).json(response);
    } catch (error) {
      this._handleError(error, res, next);
    }
  }
}

module.exports = new BackupController();
