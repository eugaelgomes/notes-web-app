const { MailService } = require("@/services/email/config/mail-service");
const addedToNoteTemplate = require("./addedToNote");

/**
 * Envia email de notificação quando um colaborador é adicionado à nota
 * @param {string} collaboratorEmail - Email do colaborador
 * @param {string} collaboratorName - Nome do colaborador
 * @param {string} noteName - Nome da nota
 * @param {string} ownerName - Nome do proprietário da nota
 * @param {string} noteId - ID da nota (opcional)
 * @returns {Object} - { success: boolean, error?: string }
 */
async function sendCollaborationNotification(collaboratorEmail, collaboratorName, noteName, ownerName, noteId = null) {
  try {
    const env = process.env.NODE_ENV || "development";
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const noteUrl = noteId ? `${frontendUrl}/notes/${noteId}` : `${frontendUrl}/notes`;

    // Gerar o template do email
    const emailTemplate = addedToNoteTemplate({
      noteName,
      ownerName,
      noteUrl
    });

    const mailOptions = {
      from: "CodaWeb Notes <support@codaweb.com.br>",
      to: collaboratorEmail,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    };

    await MailService().sendMail(mailOptions);
    
    console.log(`📧 Email de colaboração enviado para ${collaboratorEmail}`);
    return { success: true };
    
  } catch (error) {
    console.error("❌ Erro ao enviar email de colaboração:", error);
    return { 
      success: false, 
      error: error.message || "Falha ao enviar email de notificação." 
    };
  }
}

module.exports = {
  sendCollaborationNotification
};