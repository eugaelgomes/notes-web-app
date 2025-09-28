const nodemailer = require("nodemailer");

function MailService() {
  try {
    return nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } catch (error) {
    throw error
  }
}

module.exports = { MailService };
