/**
 * Teste manual para verificar o template de email de exclusão de conta
 * Execute este arquivo para testar a funcionalidade de email
 */

const { delete_account_notification } = require("../src/services/email/templates/delete_account/delete_user");

async function testDeleteAccountEmail() {
  console.log("🧪 Testando envio de email de exclusão de conta...");
  
  // Dados de teste (substitua por dados reais para teste)
  const testData = {
    nome: "João Silva",
    email: "joao.silva@example.com", // Use um email real para testar
    username: "joaosilva123"
  };

  try {
    const result = await delete_account_notification(
      testData.nome,
      testData.email,
      testData.username
    );

    if (result.success) {
      console.log("✅ Email de exclusão enviado com sucesso!");
      console.log(`📧 Destinatário: ${testData.email}`);
      console.log(`👤 Nome: ${testData.nome}`);
      console.log(`🏷️ Username: ${testData.username}`);
    } else {
      console.log("❌ Falha ao enviar email:");
      console.log("Erro:", result.error);
    }
  } catch (error) {
    console.log("💥 Erro inesperado:");
    console.error(error);
  }
}

// Executa o teste se o arquivo for executado diretamente
if (require.main === module) {
  console.log("⚠️  ATENÇÃO: Este teste enviará um email real!");
  console.log("⚠️  Certifique-se de que as configurações SMTP estão corretas.");
  console.log("⚠️  Altere o email de teste antes de executar.\n");
  
  // Descomente a linha abaixo para executar o teste
  // testDeleteAccountEmail();
  
  console.log("🔧 Para executar o teste, descomente a linha 'testDeleteAccountEmail()' no final do arquivo.");
}

module.exports = { testDeleteAccountEmail };