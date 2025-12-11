/**
 * Hook para sincronización con GitHub
 */

import { useState } from "react";
import { useToast } from "./use-toast";
import { apiRequest } from "@/services/api";

interface SyncStatus {
  configured: boolean;
  enabled: boolean;
  repo: string | null;
  missing: {
    token: boolean;
    owner: boolean;
    repo: boolean;
  };
}

interface SyncResult {
  created: number;
  updated: number;
  errors: string[];
}

interface SyncResponse {
  message: string;
  results: {
    prompts: SyncResult;
    snippets: SyncResult;
    links: SyncResult;
    guides: SyncResult;
  };
  summary: {
    prompts: { created: number; updated: number; errors: number };
    snippets: { created: number; updated: number; errors: number };
    links: { created: number; updated: number; errors: number };
    guides: { created: number; updated: number; errors: number };
  };
}

interface PushResponse {
  message: string;
  results: {
    prompts: { success: boolean; message: string };
    snippets: { success: boolean; message: string };
    links: { success: boolean; message: string };
    guides: { success: boolean; message: string };
  };
}

export function useGitHubSync() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<SyncStatus | null>(null);

  const getStatus = async () => {
    try {
      const data = await apiRequest<SyncStatus>("/api/admin/github/status");
      setStatus(data);
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: `Error obteniendo estado: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const syncFromGitHub = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<SyncResponse>("/api/admin/github/sync", {
        method: "POST",
      });
      
      toast({
        title: "Sincronización completada",
        description: `Sincronizados: ${data.summary.prompts.created + data.summary.snippets.created + data.summary.links.created + data.summary.guides.created} nuevos, ${data.summary.prompts.updated + data.summary.snippets.updated + data.summary.links.updated + data.summary.guides.updated} actualizados`,
      });
      
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: `Error sincronizando desde GitHub: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const pushToGitHub = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<PushResponse>("/api/admin/github/push", {
        method: "POST",
      });
      
      toast({
        title: "Push completado",
        description: "Datos enviados a GitHub correctamente",
      });
      
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: `Error enviando a GitHub: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const syncResource = async (type: "prompts" | "snippets" | "links" | "guides") => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ message: string; result: SyncResult }>(
        `/api/admin/github/sync/${type}`,
        { method: "POST" }
      );
      
      toast({
        title: "Sincronización completada",
        description: `${type}: ${data.result.created} nuevos, ${data.result.updated} actualizados`,
      });
      
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: `Error sincronizando ${type}: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const pushResource = async (type: "prompts" | "snippets" | "links" | "guides") => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ message: string; result: { success: boolean; message: string } }>(
        `/api/admin/github/push/${type}`,
        { method: "POST" }
      );
      
      toast({
        title: "Push completado",
        description: data.result.message,
      });
      
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: `Error enviando ${type}: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    status,
    isLoading,
    getStatus,
    syncFromGitHub,
    pushToGitHub,
    syncResource,
    pushResource,
  };
}

