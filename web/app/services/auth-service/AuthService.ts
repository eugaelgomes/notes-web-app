// services/auth-service/AuthService.ts
import { jwtDecode } from "jwt-decode";
import { API_ENDPOINTS } from "../api-routes";
import { apiClient, handleResponse } from "../api-methods";

//
// --- Types ---
//
export interface User {
  id?: string;
  username?: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  role?: string;
  role_name?: string;
  [key: string]: unknown;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  name?: string;
}

//
// --- Utils ---
//
export function decodeToken(token: string) {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

//
// --- Autenticação ---
//
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await apiClient.post(API_ENDPOINTS.SIGNIN, credentials);
  const data = await handleResponse<{
    success?: boolean;
    data?: LoginResponse;
    user?: User;
    token?: string;
  }>(response);

  // A resposta do backend vem estruturada como { success: true, message: "...", data: { user: {...}, token: "..." } }
  // Mas para manter compatibilidade, retornamos apenas o conteúdo de data
  if (data.success && data.data) {
    return data.data;
  }

  // Fallback para estruturas de resposta mais simples
  return data as LoginResponse;
}

export async function createUserService(
  userData: CreateUserData | FormData
): Promise<{ message: string }> {
  const response = await apiClient.post(API_ENDPOINTS.CREATE_ACCOUNT, userData);
  const text = await response.text();

  if (!response.ok) {
    try {
      const errorJson = JSON.parse(text);
      if (errorJson.errors && Array.isArray(errorJson.errors)) {
        const firstError = errorJson.errors[0];
        throw new Error(firstError.msg || firstError.message || "Falha na validação");
      }
      throw new Error(errorJson.message || "Falha ao criar usuário");
    } catch {
      throw new Error(text || "Falha ao criar usuário");
    }
  }

  return { message: text };
}

//
// --- Usuário atual ---
//
export async function getUserData(): Promise<User> {
  const response = await apiClient.get(API_ENDPOINTS.ME);
  return await handleResponse<User>(response);
}

export async function updateUserData(userData: Partial<User>): Promise<User> {
  const response = await apiClient.put(API_ENDPOINTS.UPDATE_PROFILE, userData);
  const data = await handleResponse<User>(response);

  return {
    name: data.name,
    email: data.email,
    username: data.username,
    avatar_url: data.avatar_url,
    role: data.role_name,
  };
}

export async function updatePassword(currentPassword: string, newPassword: string): Promise<void> {
  const response = await apiClient.put(API_ENDPOINTS.UPDATE_PASSWORD, {
    currentPassword,
    newPassword,
  });
  return await handleResponse<void>(response);
}

//
// --- Administração ---
//
export async function getUsers(): Promise<User[]> {
  const response = await apiClient.get(API_ENDPOINTS.USERS);
  return await handleResponse<User[]>(response);
}

export async function logout(): Promise<void> {
  const response = await apiClient.post(API_ENDPOINTS.LOGOUT);
  return await handleResponse<void>(response);
}

export async function refreshToken(): Promise<LoginResponse> {
  const response = await apiClient.post(API_ENDPOINTS.REFRESH);
  return await handleResponse<LoginResponse>(response);
}

//
// --- Google OAuth ---
//
export function initiateGoogleLogin(): void {
  // Redireciona diretamente para o endpoint de autenticação Google
  window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"}${API_ENDPOINTS.GOOGLE_AUTH}`;
}

//
// --- Senha ---
//
export async function requestPasswordRecovery(email: string): Promise<{ message: string }> {
  const response = await apiClient.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
  return await handleResponse<{ message: string }>(response);
}

export async function resetPassword(token: string, password: string): Promise<{ message: string }> {
  const response = await apiClient.post(API_ENDPOINTS.RESET_PASSWORD, {
    token,
    password,
  });
  return await handleResponse<{ message: string }>(response);
}

// --- Deletar conta ---
//
export async function deleteUser(): Promise<void> {
  const response = await apiClient.delete(API_ENDPOINTS.DELETE_ACCOUNT);
  return await handleResponse<void>(response);
}
