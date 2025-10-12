# 📧 SMTP Service Setup - Codaweb Notes

> Guia completo para configuração do serviço de envio de emails usando Nodemailer com diferentes provedores SMTP.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Provedores Suportados](#provedores-suportados)
- [Configuração Atual (Zoho)](#configuração-atual-zoho)
- [Configuração de Outros Provedores](#configuração-de-outros-provedores)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Templates de Email](#templates-de-email)
- [Implementação](#implementação)
- [Testes](#testes)
- [Troubleshooting](#troubleshooting)
- [Segurança](#segurança)

## 🔍 Visão Geral

O sistema de email do Codaweb Notes utiliza **Nodemailer** para envio de emails transacionais, incluindo:

- ✅ **Email de Boas-vindas** após registro
- ✅ **Recuperação de Senha** com token seguro
- ✅ **Templates HTML responsivos**
- ✅ **Suporte a múltiplos provedores SMTP**

### Arquitetura do Sistema

```
src/services/email/
├── config/
│   └── mail-service.js          # Configuração do transporter
├── templates/
│   ├── welcome-mail.js          # Template de boas-vindas
│   └── rescue-pass-mail.js      # Template de recuperação
```

## 🌐 Provedores Suportados

### Atualmente Configurado: Zoho Mail

O projeto está configurado para usar **Zoho Mail** como provedor SMTP principal:

```javascript
// Configuração atual em mail-service.js
{
  host: "smtp.zoho.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  }
}
```

### Outros Provedores Compatíveis

| Provedor | Host | Porta | Secure |
|----------|------|-------|---------|
| **Gmail** | smtp.gmail.com | 587 | false |
| **Outlook** | smtp-mail.outlook.com | 587 | false |
| **Yahoo** | smtp.mail.yahoo.com | 587 | false |
| **SendGrid** | smtp.sendgrid.net | 587 | false |
| **Mailgun** | smtp.mailgun.org | 587 | false |
| **Amazon SES** | email-smtp.region.amazonaws.com | 587 | false |

## ⚙️ Configuração Atual (Zoho)

### 1. Criar Conta no Zoho Mail

1. Acesse [Zoho Mail](https://www.zoho.com/mail/)
2. Crie uma conta ou use uma existente
3. Configure um domínio personalizado (opcional)

### 2. Configurar Autenticação

#### Opção A: Senha de Aplicativo (Recomendado)
```bash
1. Acesse: Zoho Mail > Configurações > Segurança
2. Ative "Autenticação de dois fatores"
3. Gere uma "Senha de aplicativo" específica
4. Use essa senha nas variáveis de ambiente
```

#### Opção B: Senha da Conta
```bash
# Menos seguro, use apenas para desenvolvimento
# Use a senha normal da conta Zoho
```

### 3. Configurar Variáveis de Ambiente

```env
# SMTP Configuration - Zoho Mail
EMAIL_USERNAME=seu-email@seudominio.com
EMAIL_PASSWORD=sua_senha_de_aplicativo

# Frontend URL para links nos emails
FRONTEND_URL=https://seudominio.com
# ou para desenvolvimento:
FRONTEND_URL=http://localhost:3000

# Email sender information
EMAIL_FROM_NAME=CodaWeb Support
EMAIL_FROM_ADDRESS=support@codaweb.com.br
```

## 🔧 Configuração de Outros Provedores

### Gmail

```javascript
// Substitua em mail-service.js
{
  service: 'gmail', // ou use host: "smtp.gmail.com"
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD, // Senha de app do Gmail
  }
}
```

**Configuração do Gmail:**
1. Ative a verificação em 2 etapas
2. Gere uma senha de app: [Google Account Settings](https://myaccount.google.com/apppasswords)
3. Use a senha de app no `.env`

### Outlook/Hotmail

```javascript
{
  host: "smtp-mail.outlook.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  }
}
```

### SendGrid

```javascript
{
  host: "smtp.sendgrid.net",
  port: 587,
  secure: false,
  auth: {
    user: "apikey",
    pass: process.env.SENDGRID_API_KEY,
  }
}
```

### Amazon SES

```javascript
{
  host: "email-smtp.us-east-1.amazonaws.com", // Substitua pela sua região
  port: 587,
  secure: false,
  auth: {
    user: process.env.AWS_SES_ACCESS_KEY,
    pass: process.env.AWS_SES_SECRET_KEY,
  }
}
```

## 📝 Variáveis de Ambiente

### Arquivo `.env` Completo

```env
# ================================
# SMTP SERVICE CONFIGURATION
# ================================

# Provider: Zoho Mail (atual)
EMAIL_USERNAME=seu-email@zoho.com
EMAIL_PASSWORD=sua_senha_de_aplicativo

# Alternative providers (descomente para usar)
# SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
# AWS_SES_ACCESS_KEY=AKIAXXXXXXXX
# AWS_SES_SECRET_KEY=xxxxxxxxxxxxxxxx

# Email sender configuration
EMAIL_FROM_NAME=CodaWeb Support
EMAIL_FROM_ADDRESS=support@codaweb.com.br

# Frontend URLs for email links
FRONTEND_URL=https://codaweb.com.br
# Development: FRONTEND_URL=http://localhost:3000

# Email settings
EMAIL_TIMEOUT=30000
EMAIL_CONNECTION_TIMEOUT=60000

# Environment
NODE_ENV=production
```

### Validação de Variáveis

Adicione ao início do `mail-service.js`:

```javascript
// Validação de variáveis obrigatórias
const requiredEnvVars = ['EMAIL_USERNAME', 'EMAIL_PASSWORD', 'FRONTEND_URL'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}
```

## 📄 Templates de Email

### 1. Welcome Email (`welcome-mail.js`)

**Características:**
- ✅ Template HTML responsivo
- ✅ Design moderno com cores da marca
- ✅ Links para redes sociais
- ✅ Compatível com todos os clientes de email

**Parâmetros:**
```javascript
welcome_message(nome, email, username)
```

**Personalização:**
```javascript
// Edite as variáveis no template
const brandColor = "#00be67";
const companyName = "CodaWeb";
const supportEmail = "support@codaweb.com.br";
const websiteUrl = "https://codaweb.com.br";
```

### 2. Password Reset (`rescue-pass-mail.js`)

**Características:**
- ✅ Token seguro destacado
- ✅ Link direto para reset
- ✅ Expiração clara (24 horas)
- ✅ Fallback com token manual

**Parâmetros:**
```javascript
mail_rescue_pass(email, token)
```

**URLs de Reset:**
```javascript
// Produção
${process.env.FRONTEND_URL}/auth/reset-password?token=${token}

// Desenvolvimento
${process.env.FRONTEND_URL}/?reset_token=${token}
```

### Criando Novos Templates

```javascript
// src/services/email/templates/novo-template.js
const { MailService } = require("@/services/email/config/mail-service");

async function novo_template(parametros) {
  try {
    let mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: email,
      subject: "Assunto do Email",
      html: `<!-- Seu HTML aqui -->`,
      text: "Versão texto simples" // Fallback
    };
    
    await MailService().sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email failed:", error);
    return { success: false, error: error.message };
  }
}

module.exports = { novo_template };
```

## 🚀 Implementação

### 1. Instalação das Dependências

```bash
# Já incluído no package.json
npm install nodemailer
```

### 2. Configuração Básica

```javascript
// src/services/email/config/mail-service.js
const nodemailer = require("nodemailer");

function MailService() {
  try {
    const config = {
      host: process.env.SMTP_HOST || "smtp.zoho.com",
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE === 'true' || true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Configurações adicionais
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
    };

    return nodemailer.createTransporter(config);
  } catch (error) {
    console.error("SMTP Configuration Error:", error);
    throw error;
  }
}

module.exports = { MailService };
```

### 3. Uso nos Controllers

```javascript
// Em controllers/auth-controller.js ou user-controller.js
const { welcome_message } = require("@/services/email/templates/welcome-mail");
const mail_rescue_pass = require("@/services/email/templates/rescue-pass-mail");

// Enviar email de boas-vindas
const emailResult = await welcome_message(user.name, user.email, user.email);
if (!emailResult.success) {
  console.error("Failed to send welcome email:", emailResult.error);
}

// Enviar email de recuperação
const resetResult = await mail_rescue_pass(email, resetToken);
if (!resetResult.success) {
  console.error("Failed to send reset email:", resetResult.error);
}
```

## 🧪 Testes

### 1. Teste Manual

Crie um script de teste:

```javascript
// test-email.js
require('dotenv').config();
const { welcome_message } = require('./src/services/email/templates/welcome-mail');

async function testEmail() {
  try {
    console.log('Testando envio de email...');
    
    const result = await welcome_message(
      "Teste User",
      "seu-email-de-teste@gmail.com",
      "teste@example.com"
    );
    
    if (result.success) {
      console.log('✅ Email enviado com sucesso!');
    } else {
      console.log('❌ Falha no envio:', result.error);
    }
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testEmail();
```

Execute o teste:
```bash
node test-email.js
```

### 2. Teste da Configuração SMTP

```javascript
// test-smtp-connection.js
const { MailService } = require('./src/services/email/config/mail-service');

async function testConnection() {
  try {
    const transporter = MailService();
    const isValid = await transporter.verify();
    
    if (isValid) {
      console.log('✅ Conexão SMTP válida!');
    } else {
      console.log('❌ Conexão SMTP inválida');
    }
  } catch (error) {
    console.error('❌ Erro na conexão:', error);
  }
}

testConnection();
```

### 3. Teste de Integração

```javascript
// tests/email.test.js (para Jest)
const { welcome_message } = require('../src/services/email/templates/welcome-mail');

describe('Email Service', () => {
  test('should send welcome email successfully', async () => {
    const result = await welcome_message(
      "Test User",
      "test@example.com",
      "testuser"
    );
    
    expect(result.success).toBe(true);
  });
});
```

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de Autenticação
```
Error: Invalid login: 535 5.7.8 Error: authentication failed
```

**Soluções:**
- ✅ Verificar se EMAIL_USERNAME e EMAIL_PASSWORD estão corretos
- ✅ Usar senha de aplicativo em vez da senha normal
- ✅ Ativar "Acesso de apps menos seguros" (se disponível)
- ✅ Verificar se a conta não está bloqueada

#### 2. Erro de Conexão
```
Error: connect ECONNREFUSED
```

**Soluções:**
- ✅ Verificar host e porta SMTP
- ✅ Testar conectividade de rede
- ✅ Verificar firewall e proxy
- ✅ Confirmar se o provedor permite SMTP

#### 3. Timeout
```
Error: Greeting never received
```

**Soluções:**
- ✅ Aumentar timeout na configuração
- ✅ Verificar latência da rede
- ✅ Tentar porta alternativa (25, 465, 587)

#### 4. Rate Limiting
```
Error: 550 5.4.5 Daily sending quota exceeded
```

**Soluções:**
- ✅ Verificar limites diários do provedor
- ✅ Implementar queue de emails
- ✅ Distribuir envios ao longo do tempo

### Debug Avançado

Ative logs detalhados:

```javascript
// Em mail-service.js
const transporter = nodemailer.createTransporter({
  // ... configurações existentes
  debug: true, // Logs detalhados
  logger: true // Logger ativo
});

// Log de eventos
transporter.on('idle', () => console.log('Transporter idle'));
transporter.on('error', (err) => console.error('Transporter error:', err));
```

### Verificação de DNS

```bash
# Verificar MX records do domínio
nslookup -type=MX zoho.com

# Teste de conectividade SMTP
telnet smtp.zoho.com 465
```

## 🔒 Segurança

### Boas Práticas

#### 1. Credenciais Seguras
- ✅ **Nunca** commite credenciais no código
- ✅ Use senhas de aplicativo específicas
- ✅ Rotacione senhas periodicamente
- ✅ Use variáveis de ambiente criptografadas

#### 2. Validação de Email
```javascript
// Validar email antes de enviar
const validator = require('validator');

if (!validator.isEmail(email)) {
  throw new Error('Invalid email address');
}
```

#### 3. Rate Limiting
```javascript
// Implementar rate limiting para emails
const rateLimit = require('express-rate-limit');

const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 emails por IP
  message: 'Too many email requests, try again later'
});
```

#### 4. Sanitização de Dados
```javascript
// Sanitizar dados antes de usar em templates
const escape = require('lodash.escape');

const safeName = escape(userName);
const safeEmail = validator.normalizeEmail(email);
```

### Configurações de Segurança

```javascript
// mail-service.js - Configurações seguras
{
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // TLS
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2'
  }
}
```

## 📊 Monitoramento

### Logs de Email

```javascript
// Implementar logging estruturado
const winston = require('winston');

const emailLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/email.log' })
  ]
});

// Nos templates
emailLogger.info('Email sent', {
  to: email,
  template: 'welcome',
  success: true,
  timestamp: new Date().toISOString()
});
```

### Métricas

```javascript
// Contador de emails enviados
let emailStats = {
  sent: 0,
  failed: 0,
  lastSent: null
};

// Incrementar após envio
emailStats.sent++;
emailStats.lastSent = new Date();
```

## 📚 Recursos Adicionais

### Documentação
- [Nodemailer Documentation](https://nodemailer.com/)
- [Zoho Mail SMTP Settings](https://www.zoho.com/mail/help/smtp-settings.html)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)

### Ferramentas de Teste
- [Mail Trap](https://mailtrap.io/) - SMTP testing
- [SendGrid Testing](https://sendgrid.com/) - Email delivery testing
- [Mail Hog](https://github.com/mailhog/MailHog) - Local SMTP testing

### Templates Avançados
- [MJML](https://mjml.io/) - Framework para emails responsivos
- [Foundation for Emails](https://get.foundation/emails.html)
- [Email Template Editor](https://unlayer.com/)

---

## 📞 Suporte

### Checklist de Configuração

- [ ] Variáveis de ambiente configuradas
- [ ] Credenciais SMTP válidas
- [ ] Teste de conexão realizado
- [ ] Templates funcionando
- [ ] Links de reset configurados
- [ ] Logs implementados

### Contato

Para problemas específicos do serviço de email:

1. Verifique os logs da aplicação
2. Teste a conexão SMTP
3. Valide as credenciais
4. Consulte a documentação do provedor

---

**Última atualização:** Setembro 2025  
**Versão:** 1.0.0  
**Provedor Atual:** Zoho Mail