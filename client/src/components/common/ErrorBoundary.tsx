/**
 * Error boundary component for catching React errors
 * Enhanced with ChunkLoadError detection for PWA deployments
 */

import React, { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isChunkLoadError } from "@/lib/chunk-error-handler";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  isChunkError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, isChunkError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const chunkError = isChunkLoadError(error);
    return { 
      hasError: true, 
      error,
      isChunkError: chunkError.isChunkError,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Error logged by React Error Boundary - errorInfo contains component stack
    // In production, this should be sent to an error tracking service
    console.error("ErrorBoundary caught error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, isChunkError: false });
  };

  handleReload = () => {
    // Clear caches and reload page for chunk errors
    if (this.state.isChunkError && typeof window !== 'undefined' && 'caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName).catch(() => {});
        });
      }).finally(() => {
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Special handling for ChunkLoadError
      if (this.state.isChunkError) {
        return (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8">
            <div className="rounded-full bg-yellow-500/10 p-4">
              <RefreshCw className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="space-y-2 text-center max-w-md">
              <h2 className="text-xl font-semibold">Actualización Disponible</h2>
              <p className="text-sm text-muted-foreground">
                Se ha detectado una nueva versión de la aplicación. Por favor, recarga la página para obtener la última versión.
              </p>
              {this.state.error?.message && (
                <p className="text-xs text-muted-foreground mt-2 font-mono">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={this.handleReload} className="bg-primary">
                <RefreshCw className="h-4 w-4 mr-2" />
                Recargar Página
              </Button>
            </div>
          </div>
        );
      }

      // Generic error handling
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2 text-center max-w-md">
            <h2 className="text-xl font-semibold">Algo salió mal</h2>
            <p className="text-sm text-muted-foreground">
              {this.state.error?.message || "Ocurrió un error inesperado"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={this.handleReset} variant="outline">
              Intentar de nuevo
            </Button>
            <Button onClick={this.handleReload} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Recargar
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

