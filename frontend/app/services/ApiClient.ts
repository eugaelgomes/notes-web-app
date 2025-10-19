// services/ApiClient.ts
import { API_CONFIG } from "../config/Api";

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = API_CONFIG.headers;
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      credentials: 'include', // Para enviar cookies HttpOnly
    };

    try {
      const response = await fetch(url, config);
      return response;
    } catch (error) {
      throw new ApiError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0
      );
    }
  }

  async get(endpoint: string, options: RequestInit = {}): Promise<Response> {
    return this.request(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  async post(endpoint: string, data?: unknown, options: RequestInit = {}): Promise<Response> {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(endpoint: string, data?: unknown, options: RequestInit = {}): Promise<Response> {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch(endpoint: string, data?: unknown, options: RequestInit = {}): Promise<Response> {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(endpoint: string, options: RequestInit = {}): Promise<Response> {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

// Função utilitária para tratar respostas
export async function handleResponse<T = unknown>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorData: unknown;

    try {
      if (contentType?.includes('application/json')) {
        errorData = await response.json();
        if (typeof errorData === 'object' && errorData !== null && 'message' in errorData) {
          errorMessage = (errorData as { message: string }).message;
        }
      } else {
        errorMessage = await response.text() || errorMessage;
      }
    } catch {
      // Se não conseguir ler o corpo da resposta, usar mensagem padrão
    }

    throw new ApiError(errorMessage, response.status, errorData);
  }

  // Se a resposta não tem conteúdo, retornar objeto vazio
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }

  try {
    if (contentType?.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text() as T;
    }
  } catch (error) {
    throw new ApiError(
      `Failed to parse response: ${error instanceof Error ? error.message : 'Unknown error'}`,
      response.status
    );
  }
}

// Instância singleton do cliente API
export const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api");

export default apiClient;