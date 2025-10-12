const { MailService } = require("@/services/email/config/mail-service");
const backupReadyTemplate = require("@/services/email/templates/backup/backupReady");

/**
 * Envia email com backup de dados do usuário
 * @param {string} userEmail - Email do usuário
 * @param {string} userName - Nome do usuário
 * @param {Object} backupData - Dados do backup
 * @param {Object} options - Opções do envio
 * @returns {Object} - { success: boolean, error?: string }
 */
async function sendBackupEmail(userEmail, userName, backupData, options = {}) {
  try {
    // Calcular tamanho do arquivo
    const backupJson = JSON.stringify(backupData, null, 2);
    const fileSizeBytes = Buffer.byteLength(backupJson, "utf8");
    const fileSize = formatFileSize(fileSizeBytes);

    // Verificar se arquivo não é muito grande para email (limite: 25MB)
    const maxEmailSize = 25 * 1024 * 1024; // 25MB
    const sendAsAttachment = fileSizeBytes < maxEmailSize;

    // Gerar o template do email
    const emailTemplate = backupReadyTemplate({
      userName: userName,
      totalNotes: backupData.backup_info?.total_notes || 0,
      fileSize: fileSize,
      downloadUrl: options.downloadUrl || null
    });

    const mailOptions = {
      from: "CodaWeb Notes <support@codaweb.com.br>",
      to: userEmail,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    };

    // Adicionar anexo se arquivo não for muito grande
    if (sendAsAttachment && !options.downloadUrl) {
      const filename = `notes-backup-${Date.now()}.json`;
      mailOptions.attachments = [
        {
          filename: filename,
          content: backupJson,
          contentType: "application/json"
        }
      ];
    }

    await MailService().sendMail(mailOptions);
    
    console.log(`📧 Email de backup enviado para ${userEmail} (${fileSize})`);
    return { 
      success: true, 
      fileSize: fileSizeBytes,
      sentAsAttachment: sendAsAttachment 
    };
    
  } catch (error) {
    console.error("❌ Erro ao enviar email de backup:", error);
    return { 
      success: false, 
      error: error.message || "Falha ao enviar email de backup." 
    };
  }
}

/**
 * Formata tamanho de arquivo em formato legível
 * @param {number} bytes - Tamanho em bytes
 * @returns {string} Tamanho formatado
 */
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

module.exports = {
  sendBackupEmail,
  formatFileSize
};