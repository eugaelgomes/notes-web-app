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
  return await handleResponse(response);
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
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Inclui cookies HttpOnly
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || "Falha ao obter dados do usuário");
    } catch {
      throw new Error(errorText || "Falha ao obter dados do usuário");
    }
  }

  return await response.json();
}

export async function updateUserData(userData) {
  const response = await fetch(`${API_BASE_URL}/auth/me/update-profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Inclui cookies HttpOnly
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || "Falha ao atualizar perfil");
    } catch {
      throw new Error(errorText || "Falha ao atualizar perfil");
    }
  }

  const data = await response.json();

  return {
    name: data.name,
    email: data.email,
    username: data.username,
    //role: data.role_name,
  };
}

export async function updatePassword(currentPassword, newPassword) {
  const response = await fetch(`${API_BASE_URL}/auth/me/update-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Inclui cookies HttpOnly
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || "Falha ao atualizar senha");
    } catch {
      throw new Error(errorText || "Falha ao atualizar senha");
    }
  }

  return await response.json();
}

//
// --- Administração ---
//
export async function getUsers() {
  const response = await fetch(`${API_BASE_URL}/auth/users`, {
    method: "GET",
    credentials: "include", // Inclui cookies HttpOnly
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || "Falha ao buscar usuários");
    } catch {
      throw new Error(errorText || "Falha ao buscar usuários");
    }
  }
  
  return await response.json();
}

export async function logout() {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include", // Inclui cookies HttpOnly
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || "Falha no logout");
    } catch {
      throw new Error(errorText || "Falha no logout");
    }
  }

  return await response.json();
}

export async function refreshToken() {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include", // Inclui cookies HttpOnly
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || "Falha ao renovar token");
    } catch {
      throw new Error(errorText || "Falha ao renovar token");
    }
  }

  return await response.json();
}

//
// --- Senha ---
//
export async function requestPasswordRecovery(email) {
  const response = await fetch(`${API_BASE_URL}/password/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || "Falha ao solicitar recuperação de senha");
    } catch {
      throw new Error(errorText || "Falha ao solicitar recuperação de senha");
    }
  }

  return await response.json();
}

export async function resetPassword(token, password) {
  const response = await fetch(`${API_BASE_URL}/password/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || "Falha ao redefinir senha");
    } catch {
      throw new Error(errorText || "Falha ao redefinir senha");
    }
  }

  return await response.json();
}
