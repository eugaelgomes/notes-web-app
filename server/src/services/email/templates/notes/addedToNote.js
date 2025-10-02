module.exports = ({ noteName, ownerName, noteUrl }) => {
    const env = process.env.NODE_ENV || "development";
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const viewNoteLink = noteUrl || `${frontendUrl}/notes`;

    return {
        subject: `Você foi adicionado à nota: ${noteName}`,
        html: `
            <!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>Nova Colaboração - CodaWeb Notes</title>
  <style>
    /* Estilos base (modo claro) */
    html, body {
      margin: 0 auto !important;
      padding: 0 !important;
      height: 100% !important;
      width: 100% !important;
      background: #f4f4f4;
      font-family: 'Segoe UI', 'Arial', sans-serif;
      color: #333;
    }

    table {
      border-spacing: 0 !important;
      border-collapse: collapse !important;
      margin: 0 auto !important;
    }

    .container {
      width: 100%;
      max-width: 600px;
      margin: 30px auto;
      background: #fffdf7;
      border-radius: 12px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.08);
      overflow: hidden;
      border: 1px solid #e6e6e6;
    }

    .header {
      background: #00be67;
      padding: 20px;
      text-align: center;
      border-bottom: 4px solid #009e57;
    }
    .header h1 {
      margin: 0;
      color: #fff;
      font-size: 26px;
      font-weight: 700;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
    }
    .header small {
      display: block;
      color: #cfffec;
      margin-top: 4px;
      font-size: 14px;
    }
    .icon {
      vertical-align: middle;
    }

    .main-content {
      padding: 30px 25px;
    }
    h2 {
      font-size: 20px;
      font-weight: 600;
      color: #222;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      margin: 0 0 18px 0;
      color: #333;
    }

    .button {
      display: inline-block;
      background: #00be67;
      color: #fff !important;
      padding: 12px 28px;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
      margin: 20px auto;
      font-size: 15px;
      text-decoration: none;
      transition: background .2s ease;
    }
    .button:hover {
      background: #009e57;
    }

    .note-box {
      background: #e3f2fd;
      border-left: 6px solid #2196f3;
      padding: 15px;
      margin: 20px 0;
      border-radius: 0 6px 6px 0;
      box-shadow: 2px 2px 6px rgba(0,0,0,0.1);
    }
    .note-box h3 {
      margin: 0 0 8px 0;
      color: #1976d2;
      font-size: 16px;
      font-weight: 600;
    }
    .note-box p {
      margin: 0;
      color: #555;
      font-size: 14px;
    }

    .collaboration-info {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .collaboration-info .owner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 10px;
      font-weight: 600;
      color: #495057;
    }

    .features {
      margin: 25px 0;
    }
    .features ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .features li {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      color: #666;
      font-size: 14px;
    }
    .features li::before {
      content: "✓";
      color: #00be67;
      font-weight: bold;
      font-size: 16px;
    }

    .footer {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 25px;
      font-size: 12px;
      color: #777;
    }
    .footer p {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 6px;
      margin: 5px 0;
    }
    .footer a {
      color: #555;
      text-decoration: underline;
    }

    /* Dark mode automático */
    @media (prefers-color-scheme: dark) {
      body {
        background: #1c1c1c !important;
        color: #eaeaea !important;
      }
      .container {
        background: #2a2a2a !important;
        border: 1px solid #333 !important;
      }
      h2 {
        color: #fff !important;
      }
      p {
        color: #ddd !important;
      }
      .footer {
        color: #aaa !important;
      }
      .footer a {
        color: #bbb !important;
      }
      .note-box {
        background: #1e3a5f !important;
        border-left: 6px solid #42a5f5 !important;
      }
      .note-box h3 {
        color: #64b5f6 !important;
      }
      .note-box p {
        color: #ccc !important;
      }
      .collaboration-info {
        background: #333 !important;
        border: 1px solid #444 !important;
      }
      .collaboration-info .owner {
        color: #ccc !important;
      }
      .features li {
        color: #bbb !important;
      }
    }

    /* Mobile */
    @media screen and (max-width: 600px) {
      .button {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box;
      }
      .header h1 {
        flex-direction: column;
        gap: 4px;
      }
      .collaboration-info .owner {
        flex-direction: column;
        gap: 4px;
      }
    }
  </style>
</head>
<body>
  <center style="width: 100%; background-color: #f4f4f4;">
    <table role="presentation" class="container">
      <tr>
        <td class="header">
          <h1>
            <!-- 📒 Ícone de caderno -->
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="26" height="26" fill="white" viewBox="0 0 24 24"><path d="M5 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12V2H5zm0 2h10v14H5V4z"/><path d="M17 2v20h2a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2z"/></svg>
            CodaWeb Notes
          </h1>
          <small>Colaboração em tempo real</small>
        </td>
      </tr>

      <tr>
        <td class="main-content">
          <h2>
            <!-- 👥 Ícone de colaboração -->
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="20" height="20" fill="#00be67" viewBox="0 0 24 24"><path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.999 1.999 0 0 0 18.04 7c-.68 0-1.3.42-1.56 1.05L14.5 16H17v6h3zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zm1.5 1h-4c-.83 0-1.5.67-1.5 1.5v6h2v7h3v-7h2v-6c0-.83-.67-1.5-1.5-1.5zM6.5 6C7.33 6 8 5.33 8 4.5S7.33 3 6.5 3 5 3.67 5 4.5 5.67 6 6.5 6zm2.5 16v-7H7v7h2zm-1.5-9c-.83 0-1.5.67-1.5 1.5v4.5h2v-6h-0.5z"/></svg>
            Nova Colaboração!
          </h2>
          
          <p>Olá!</p>
          
          <div class="collaboration-info">
            <div class="owner">
              <!-- 👤 Ícone de usuário -->
              <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              <strong>${ownerName}</strong> adicionou você como colaborador
            </div>
          </div>

          <div class="note-box">
            <h3>📝 ${noteName}</h3>
            <p>Agora você pode visualizar, editar e colaborar nesta nota em tempo real!</p>
          </div>

          <p>Como colaborador, você pode:</p>
          
          <div class="features">
            <ul>
              <li>Visualizar todo o conteúdo da nota</li>
              <li>Editar blocos e adicionar novo conteúdo</li>
              <li>Ver outros colaboradores da nota</li>
              <li>Receber atualizações em tempo real</li>
              <li>Acessar o histórico de mudanças</li>
            </ul>
          </div>

          <div style="text-align: center;">
            <a href="${viewNoteLink}" class="button">Acessar Nota</a>
          </div>

          <p style="text-align: center; font-size: 13px; color: #888;">
            A nota já está disponível em sua conta. Faça login para começar a colaborar!
          </p>

          <p style="font-size: 14px; color: #666;">
            Se você não esperava este convite ou não conhece ${ownerName}, pode ignorar este email com segurança.
          </p>
        </td>
      </tr>
    </table>
    <div class="footer">
      <p>
        <!-- 📝 Ícone de nota -->
        <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M3 4a1 1 0 0 1 1-1h10l5 5v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4zm11 0v4h4l-4-4z"/></svg>
        CodaWeb Notes &copy; 2025
      </p>
      <p>Dúvidas? Entre em contato: <a href="mailto:contact@codaweb.com.br">contact@codaweb.com.br</a></p>
    </div>
  </center>
</body>
</html>
        `,
        text: `
Nova Colaboração - CodaWeb Notes

Olá!

${ownerName} adicionou você como colaborador na nota: ${noteName}

Como colaborador, você pode:
• Visualizar todo o conteúdo da nota
• Editar blocos e adicionar novo conteúdo  
• Ver outros colaboradores da nota
• Receber atualizações em tempo real
• Acessar o histórico de mudanças

Acesse sua conta para começar a colaborar: ${viewNoteLink}

A nota já está disponível em sua conta. Faça login para começar a colaborar!

Se você não esperava este convite ou não conhece ${ownerName}, pode ignorar este email com segurança.

---
CodaWeb Notes © 2025
Dúvidas? Entre em contato: contact@codaweb.com.br
        `.trim()
    };
};