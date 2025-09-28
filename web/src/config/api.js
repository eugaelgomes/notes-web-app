// Use caminho relativo em todas as ambientes para manter cookies como first‑party
// Em dev, o Vite faz proxy para o backend; em prod, a CDN/host deve reescrever /api para o backend
export const API_BASE_URL = '/api';
