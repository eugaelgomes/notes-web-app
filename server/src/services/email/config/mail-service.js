const nodemailer = require("nodemailer");
const { parse } = require("path");

function MailService() {
  try {
    // Config de servidor SMTP - .env
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10),
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
