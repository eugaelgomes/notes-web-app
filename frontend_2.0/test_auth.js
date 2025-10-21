// Teste simples de autenticação
async function testAuth() {
  try {
    const response = await fetch('http://localhost:8080/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username: 'test', // Substitua por um usuário válido
        password: 'test'  // Substitua por uma senha válida
      })
    });

    console.log('Status:', response.status);
    console.log('Headers:', [...response.headers.entries()]);
    
    const data = await response.json();
    console.log('Response data:', data);
    
    // Teste de obter perfil
    const profileResponse = await fetch('http://localhost:8080/api/auth/getProfile', {
      credentials: 'include'
    });
    
    console.log('Profile status:', profileResponse.status);
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('Profile data:', profileData);
    }
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

testAuth();