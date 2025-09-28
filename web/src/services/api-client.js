// services/api-client.js
import { API_BASE_URL } from "../config/api";

// Cliente API simples sem auto-refresh
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
      const response = await fetch(url, config);
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
      body: JSON.stringify(data),
    });
  },

  async delete(url, options = {}) {
    return this.request(url, { ...options, method: "DELETE" });
  },
};

// Função helper para processar respostas
export const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
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

  return await response.json();
};
