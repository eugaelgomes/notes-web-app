const { MailService } = require("@/services/email/config/mail-service");

async function welcome_message(nome, email, username) {
  try {
    let mailOptions = {
      from: "support codaweb <support@codaweb.com.br>",
      to: email,
      subject: "Bem vindo ao CodaWeb Notes!",
      html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="x-apple-disable-message-reformatting">
        <title>Bem-vindo ao CodaWeb</title>
        <style>
          /* Styles reset */
          html, body {
            margin: 0 auto !important;
            padding: 0 !important;
            height: 100% !important;
            width: 100% !important;
            background: #f4f4f4;
            font-family: 'Arial', sans-serif;
            color: #333333;
          }
      
          /* Table Structure */
          table, td {
            mso-table-lspace: 0pt !important;
            mso-table-rspace: 0pt !important;
          }
          
          table {
            border-spacing: 0 !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
            margin: 0 auto !important;
          }
      
          /* Main Container */
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
      
          /* Text Styles */
          h1, h2, p {
            margin: 0;
          }
          h2 {
            font-size: 22px;
            font-weight: bold;
            color: #00be67;
            margin-bottom: 12px;
          }
          p {
            font-size: 16px;
            line-height: 1.6;
          }
          a {
            text-decoration: none;
            color: #00be67;
          }
          strong {
            color: #00be67;
          }
          
          /* Header */
          .header {
            background: #00be67;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            font-size: 28px;
            font-weight: bold;
          }
      
          /* Main Content */
          .main-content {
            padding: 30px 25px;
          }
      
          /* Button (CTA) */
          .button {
            display: inline-block;
            background: #00be67;
            color: #ffffff;
            padding: 12px 25px;
            border-radius: 5px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
          }
          .button:hover {
            background: #009e57;
          }
          
          /* Rodapé */
          .footer {
            text-align: center;
            padding: 25px;
            font-size: 12px;
            color: #888888;
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
          }
          .social-icons img {
            width: 28px;
            height: 28px;
            margin: 0 8px;
          }
          .footer a {
            color: #888888;
            text-decoration: underline;
          }
      
          /* Styles for Small Screens */
          @media screen and (max-width: 600px) {
            .button-mobile {
              display: block !important;
              width: 100% !important;
              box-sizing: border-box; /* Garante que padding não estoure a largura */
            }
          }
        </style>
      </head>
      <body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly;">
        <center style="width: 100%; background-color: #f4f4f4;">
          <table role="presentation" class="container" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td class="header">
                <h1>CodaWeb</h1>
              </td>
            </tr>
      
            <tr>
              <td class="main-content">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td>
                      <h2>Welcome to CodaWeb!</h2>
                      <p style="margin-bottom: 20px;">Hello ${nome},</p>
                      <p style="margin-bottom: 20px;">Your registration was successful. We are very happy to have you with us in the CodaWeb community, your new space to learn and grow in technology.</p>
                      <p>Your username is: <strong>${username}</strong></p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center">
                      <a href="https://codaweb.com.br" class="button button-mobile">Access my account</a>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p>If you need any help, feel free to reply to this email.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <div class="footer">
            <div class="social-icons" style="margin-bottom: 20px;">
              <a href="#"><img src="https://img.icons8.com/ios-filled/50/888888/instagram-new--v1.png" alt="Instagram"></a>
              <a href="#"><img src="https://img.icons8.com/ios-filled/50/888888/linkedin.png" alt="LinkedIn"></a>
              <a href="#"><img src="https://img.icons8.com/ios-filled/50/888888/github.png" alt="GitHub"></a>
            </div>
            <p>CodaWeb &copy; 2025. All rights reserved.<br>
            Av. Exemplo, 123, Cidade, Estado</p>
            <p style="margin-top: 10px;">
              You are receiving this email because you signed up on our website/api test.<br>
            </p>
          </div>
        </center>
      </body>
      </html>`,
    };
    await MailService().sendMail(mailOptions);

    return { success: true };
  } catch (error) {
    console.error("Welcome email failed:", error);
    return { success: false, error: error.message || "Failed to send welcome email." };
  }
}

module.exports = { welcome_message };