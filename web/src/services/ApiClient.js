// services/api-client.js
import { API_BASE_URL } from "../config/Api";

// Cliente API com refresh automático de token
export const apiClient = {
  async request(url, options = {}) {
    // Configurações padrão
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Sempre incluir cookies
      ...options,
    };

    try {
      console.log(`📡 API Request: ${config.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      console.log(`📡 API Response: ${response.status} ${response.statusText}`);
      
      // Se recebeu 401 e não é uma tentativa de login/refresh, tenta renovar o token
      if (response.status === 401 && 
          !url.includes('/auth/signin') && 
          !url.includes('/auth/refresh') && 
          !options._isRetry) {
        console.log('🔄 Tentando renovar token automaticamente...');
        
        try {
          const refreshResponse = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
          });
          
          if (refreshResponse.ok) {
            console.log('✅ Token renovado com sucesso, repetindo requisição...');
            // Repetir a requisição original
            return this.request(url, { ...options, _isRetry: true });
          }
        } catch (refreshError) {
          console.error('❌ Falha ao renovar token:', refreshError);
        }
      }
      
      return response;
    } catch (error) {
      console.error("❌ [API] Erro na requisição:", error);
      throw error;
    }
  },

  // Métodos de conveniência
  async get(url, options = {}) {
    return this.request(url, { ...options, method: "GET" });
  },

  async post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
      headers:
        data instanceof FormData ? {} : { "Content-Type": "application/json" },
    });
  },

  async put(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
      headers:
        data instanceof FormData ? {} : { "Content-Type": "application/json" },
    });
  },

  async delete(url, options = {}) {
    return this.request(url, { ...options, method: "DELETE" });
  },
};

// Função helper para processar respostas
export const handleResponse = async (response) => {
  // Log dos headers de resposta para debug
  if (response.headers.get('set-cookie')) {
    console.log('🍪 Set-Cookie recebido:', response.headers.get('set-cookie'));
  }
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Erro na resposta:', response.status, errorText);
    try {
      // Tenta converter o texto em JSON
      const errorJson = JSON.parse(errorText);

      // AQUI ESTÁ A MELHORIA:
      // Procure pela mensagem em chaves comuns: 'message', 'error', 'msg'.
      // Se não encontrar nenhuma, use o JSON completo como string para depuração.
      const message =
        errorJson.message || errorJson.error || errorJson.msg || errorText;

      throw new Error(message);
    } catch (e) {
      // Se não for um JSON, o texto original do erro já é a mensagem.
      throw new Error(errorText);
    }
  }

  // Se não há conteúdo, retorna null
  if (response.status === 204) {
    return null;
  }

  const jsonData = await response.json();
  console.log('✅ Resposta da API:', jsonData);
  return jsonData;
};
