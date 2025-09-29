// services/authService.js
import { jwtDecode } from "jwt-decode";
import { API_BASE_URL } from "../../config/api";
import { apiClient, handleResponse } from "../api-client";

//
// --- Utils ---
//
export function decodeToken(token) {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

//
// --- Autenticação ---
//
export async function login(credentials) {
  const response = await apiClient.post(`${API_BASE_URL}/auth/signin`, credentials);
  const data = await handleResponse(response);
  
  // A resposta do backend vem estruturada como { success: true, message: "...", data: { user: {...}, token: "..." } }
  // Mas para manter compatibilidade, retornamos apenas o conteúdo de data
  if (data.success && data.data) {
    return data.data;
  }
  
  // Fallback para estruturas de resposta mais simples
  return data;
}

export async function createUserService(userData) {
  const response = await apiClient.post(`${API_BASE_URL}/users/create-account`, userData);
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
export async function getUserData() {
  const response = await apiClient.get(`${API_BASE_URL}/auth/me`);
  return await handleResponse(response);
}

export async function updateUserData(userData) {
  const response = await apiClient.put(`${API_BASE_URL}/auth/me/update-profile`, userData);
  const data = await handleResponse(response);
  
  return {
    name: data.name,
    email: data.email,
    username: data.username,
    avatar_url: data.avatar_url,
    role: data.role_name,
  };
}

export async function updatePassword(currentPassword, newPassword) {
  const response = await apiClient.put(`${API_BASE_URL}/auth/me/update-password`, {
    currentPassword,
    newPassword,
  });
  return await handleResponse(response);
}

//
// --- Administração ---
//
export async function getUsers() {
  const response = await apiClient.get(`${API_BASE_URL}/auth/users`);
  return await handleResponse(response);
}

export async function logout() {
  const response = await apiClient.post(`${API_BASE_URL}/auth/logout`);
  return await handleResponse(response);
}

export async function refreshToken() {
  const response = await apiClient.post(`${API_BASE_URL}/auth/refresh`);
  return await handleResponse(response);
}

//
// --- Google OAuth ---
//
export function initiateGoogleLogin() {
  // Redireciona diretamente para o endpoint de autenticação Google
  window.location.href = `${API_BASE_URL}/auth/signin/sso/google`;
}

//
// --- Senha ---
//
export async function requestPasswordRecovery(email) {
  const response = await apiClient.post(`${API_BASE_URL}/password/forgot-password`, { email });
  return await handleResponse(response);
}

export async function resetPassword(token, password) {
  const response = await apiClient.post(`${API_BASE_URL}/password/reset-password`, {
    token,
    password,
  });
  return await handleResponse(response);
}

// --- Deletar conta ---
//
export async function deleteUser() {
  const response = await apiClient.delete(`${API_BASE_URL}/users/delete-my-account`);
  return await handleResponse(response);
}