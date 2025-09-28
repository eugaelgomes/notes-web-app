const { MailService } = require("@/services/email/config/mail-service");

async function mail_rescue_pass(email, token) {
  const env = process.env.NODE_ENV || "development";
  let resetLink;
  if (env === "production") {
    resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
  } else {
    resetLink = `${process.env.FRONTEND_URL}/?reset_token=${token}`;
  }
try {
let mailOptions = {
    from: "support codaweb <support@codaweb.com.br>",
    to: email,
    subject: "Password Recovery",
    text: `Your password recovery token is: ${token}. Access ${resetLink} to reset your password.`,
    html: `
    <!DOCTYPE html>
    <html lang="en-US">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="x-apple-disable-message-reformatting">
      <title>Password Reset - CodaWeb</title>
      <style>
        /* Style Resets */
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
          font-size: 16px;
        }
        .button:hover {
          background: #009e57;
        }
        
        /* Token Box */
        .token-box {
            background-color: #f0f0f0;
            border: 1px dashed #cccccc;
            padding: 15px;
            text-align: center;
            margin: 20px 0;
            font-family: 'Courier New', Courier, monospace;
            font-size: 18px;
            font-weight: bold;
            color: #555555;
        }
    
        /* Footer */
        .footer {
          text-align: center;
          padding: 25px;
          font-size: 12px;
          color: #888888;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }
        .footer a {
          color: #888888;
          text-decoration: underline;
        }
    
        /* Mobile Styles */
        @media screen and (max-width: 600px) {
          .button-mobile {
            display: block !important;
            width: 100% !important;
            box-sizing: border-box;
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
                    <h2>Password Reset</h2>
                    <p style="margin-bottom: 20px;">Hello,</p>
                    <p style="margin-bottom: 25px;">We received a request to reset the password for your account. To proceed, click the button below:</p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="${resetLink}" class="button button-mobile">Reset Password</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 0;">
                    <p style="text-align: center; font-size: 14px; color: #888888;">This password reset link will expire in 24 hours.</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="margin-bottom: 15px;">If the button doesn't work, copy and paste the token below on the recovery page:</p>
                    <div class="token-box">${token}</div>
                  </td>
                </tr>
                <tr>
                   <td style="padding-top: 20px;">
                     <p>If you did not make this request, you can safely ignore this email. No changes will be made to your account.</p>
                   </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <div class="footer">
          <p>CodaWeb &copy; 2025. All rights reserved.<br>
          123 Example St, City, State</p>
          <p style="margin-top: 10px;">
            For questions, please contact <a href="mailto:contact@codaweb.com.br">contact@codaweb.com.br</a>
          </p>
        </div>
      </center>
    </body>
    </html>
    `,
    };
    await MailService().sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to send welcome email." };
  }
}

module.exports = mail_rescue_pass;
