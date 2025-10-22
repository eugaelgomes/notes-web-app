// services/backup-service/BackupService.ts
import { apiClient, handleResponse } from "../api-methods";
import { API_ENDPOINTS } from "../api-routes";

//
// --- Types ---
//
export interface BackupData {
  notes: unknown[];
  blocks: unknown[];
  metadata: {
    exportDate: string;
    totalNotes: number;
    totalBlocks: number;
  };
}

export interface BackupOptions {
  includeBlocks?: boolean;
  format?: "json" | "zip";
}

//
// --- Backup API ---
//

export async function createBackup(options: BackupOptions = {}): Promise<BackupData> {
  const response = await apiClient.post(API_ENDPOINTS.BACKUP_CREATE, {
    includeBlocks: options.includeBlocks ?? true,
    format: options.format ?? "json",
  });

  return await handleResponse<BackupData>(response);
}

export async function restoreBackup(
  backupData: BackupData
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post(API_ENDPOINTS.BACKUP_RESTORE, backupData);
  return await handleResponse<{ success: boolean; message: string }>(response);
}

export async function downloadBackup(format: "json" | "zip" = "json"): Promise<Blob> {
  const response = await apiClient.get(`${API_ENDPOINTS.BACKUP_DOWNLOAD}?format=${format}`);

  if (!response.ok) {
    throw new Error("Falha ao baixar backup");
  }

  return await response.blob();
}

// Função utilitária para baixar o backup como arquivo
export function downloadBackupFile(data: BackupData, filename?: string): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `backup-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
