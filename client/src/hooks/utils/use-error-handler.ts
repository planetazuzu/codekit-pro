/**
 * Hook for centralized error handling
 */

import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { APIError, ValidationError, NetworkError, isAPIError, isValidationError, isNetworkError } from "@/lib/errors";

export interface UseErrorHandlerReturn {
  handleError: (error: unknown, customMessage?: string) => void;
  handleAPIError: (error: APIError) => void;
  handleValidationError: (error: ValidationError) => void;
  handleNetworkError: (error: NetworkError) => void;
}

/**
 * Hook for handling errors consistently
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const { toast } = useToast();

  const handleAPIError = useCallback(
    (error: APIError) => {
      let message = error.message;

      // Customize message based on status code
      switch (error.statusCode) {
        case 400:
          message = "Solicitud inválida. Verifica los datos ingresados.";
          break;
        case 401:
          message = "No autorizado. Por favor inicia sesión.";
          break;
        case 403:
          message = "No tienes permiso para realizar esta acción.";
          break;
        case 404:
          message = "Recurso no encontrado.";
          break;
        case 500:
          message = "Error del servidor. Por favor intenta más tarde.";
          break;
        default:
          message = error.message || "Ocurrió un error inesperado.";
      }

      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
    [toast]
  );

  const handleValidationError = useCallback(
    (error: ValidationError) => {
      toast({
        title: "Error de validación",
        description: error.message,
        variant: "destructive",
      });
    },
    [toast]
  );

  const handleNetworkError = useCallback(
    (error: NetworkError) => {
      toast({
        title: "Error de conexión",
        description: error.message || "No se pudo conectar al servidor. Verifica tu conexión a internet.",
        variant: "destructive",
      });
    },
    [toast]
  );

  const handleError = useCallback(
    (error: unknown, customMessage?: string) => {
      if (customMessage) {
        toast({
          title: "Error",
          description: customMessage,
          variant: "destructive",
        });
        return;
      }

      if (isAPIError(error)) {
        handleAPIError(error);
      } else if (isValidationError(error)) {
        handleValidationError(error);
      } else if (isNetworkError(error)) {
        handleNetworkError(error);
      } else {
        const message =
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado.";

        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      }
    },
    [toast, handleAPIError, handleValidationError, handleNetworkError]
  );

  return {
    handleError,
    handleAPIError,
    handleValidationError,
    handleNetworkError,
  };
}

