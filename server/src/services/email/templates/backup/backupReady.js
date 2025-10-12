/**
 * Template de email para entrega de backup de dados
 * @param {Object} options - Opções do template
 * @param {string} options.userName - Nome do usuário
 * @param {string} options.totalNotes - Total de notas no backup
 * @param {string} options.fileSize - Tamanho do arquivo
 * @param {string} options.downloadUrl - URL para download (opcional)
 * @returns {Object} Template do email
 */
function backupReadyTemplate({ userName, totalNotes, fileSize, downloadUrl = null }) {
  const subject = "✅ Seu backup de dados está pronto!";

  const text = `
Olá ${userName}!

Seu backup de dados foi gerado com sucesso e está pronto para download.

DETALHES DO BACKUP:
📝 Total de notas: ${totalNotes}
📦 Tamanho do arquivo: ${fileSize}
📅 Gerado em: ${new Date().toLocaleString("pt-BR")}

${downloadUrl 
  ? `🔗 Link para download: ${downloadUrl}` 
  : "📎 O arquivo está anexado neste email."
}

IMPORTANTE:
- Este backup contém todas as suas notas e blocos
- Dados sensíveis como emails foram removidos por segurança
- O arquivo está em formato JSON para fácil importação

Obrigado por usar o CodaWeb Notes!

---
Equipe CodaWeb Notes
support@codaweb.com.br
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .success-icon { font-size: 48px; margin-bottom: 20px; }
    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
    .detail-item { margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
    .detail-item:last-child { border-bottom: none; }
    .download-btn { background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
    .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="success-icon">✅</div>
    <h1>Backup Pronto!</h1>
    <p>Seus dados foram processados com sucesso</p>
  </div>
  
  <div class="content">
    <h2>Olá, ${userName}! 👋</h2>
    
    <p>Temos uma ótima notícia! Seu backup de dados foi gerado com sucesso e está pronto para download.</p>
    
    <div class="details">
      <h3>📊 Detalhes do Backup</h3>
      <div class="detail-item">
        <strong>📝 Total de notas:</strong> ${totalNotes}
      </div>
      <div class="detail-item">
        <strong>📦 Tamanho do arquivo:</strong> ${fileSize}
      </div>
      <div class="detail-item">
        <strong>📅 Gerado em:</strong> ${new Date().toLocaleString("pt-BR")}
      </div>
      <div class="detail-item">
        <strong>📄 Formato:</strong> JSON (JavaScript Object Notation)
      </div>
    </div>

    ${downloadUrl 
      ? `<div style="text-align: center;">
           <a href="${downloadUrl}" class="download-btn">📥 Baixar Backup</a>
         </div>`
      : `<div class="warning">
           <strong>📎 Arquivo Anexado</strong><br>
           O arquivo de backup está anexado neste email para download.
         </div>`
    }

    <div class="warning">
      <h4>🔒 Informações de Segurança</h4>
      <ul>
        <li>Este backup contém todas as suas notas e blocos ativos</li>
        <li>Dados sensíveis como emails foram removidos por privacidade</li>
        <li>Blocos deletados não estão incluídos</li>
        <li>O arquivo está em formato JSON para fácil importação</li>
      </ul>
    </div>

    <p>Agradecemos por usar o <strong>CodaWeb Notes</strong>! Se você tiver alguma dúvida, não hesite em nos contatar.</p>
  </div>

  <div class="footer">
    <p>
      <strong>CodaWeb Notes</strong><br>
      📧 support@codaweb.com.br<br>
      🌐 <a href="https://notes.codaweb.com.br">notes.codaweb.com.br</a>
    </p>
    <p style="font-size: 12px; color: #999;">
      Este email foi enviado automaticamente. Por favor, não responda.
    </p>
  </div>
</body>
</html>
  `.trim();

  return {
    subject,
    text,
    html
  };
}

module.exports = backupReadyTemplate;