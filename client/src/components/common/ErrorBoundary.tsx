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
    // Check for chunk errors and React Error #31
    const chunkError = isChunkLoadError(error);
    
    // Also check error message for React Error #31 patterns
    const errorMessage = error.message || String(error);
    const isReactError31 = errorMessage.includes('react error #31') ||
      errorMessage.includes('$$typeof') ||
      (errorMessage.includes('displayName') && errorMessage.includes('render'));
    
    return { 
      hasError: true, 
      error,
      isChunkError: chunkError.isChunkError || isReactError31,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Error logged by React Error Boundary - errorInfo contains component stack
    // In production, this should be sent to an error tracking service
    console.error("ErrorBoundary caught error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
    
    // CRITICAL: Auto-reload on React Error #31 (invalid component rendering)
    const errorMessage = error.message || String(error);
    const isReactError31 = errorMessage.includes('react error #31') ||
      errorMessage.includes('$$typeof') ||
      (errorMessage.includes('displayName') && errorMessage.includes('render')) ||
      errorMessage.includes('Objects are not valid');
    
    if (isReactError31) {
      console.warn('React Error #31 detected, auto-reloading page in 1 second...');
      // Auto-reload after a short delay to allow user to see the error message
      setTimeout(() => {
        // Clear caches and reload
        if (typeof window !== 'undefined' && 'caches' in window) {
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
      }, 1000);
    }
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

      // Special handling for ChunkLoadError and React Error #31
      if (this.state.isChunkError) {
        const isReactError31 = this.state.error?.message?.includes('react error #31') ||
          this.state.error?.message?.includes('$$typeof') ||
          this.state.error?.message?.includes('Objects are not valid');
        
        return (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8">
            <div className="rounded-full bg-yellow-500/10 p-4">
              <RefreshCw className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="space-y-2 text-center max-w-md">
              <h2 className="text-xl font-semibold">
                {isReactError31 ? 'Error de Carga del Componente' : 'Actualización Disponible'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isReactError31 
                  ? 'El componente no se pudo cargar correctamente. Esto suele ocurrir después de una actualización. Por favor, recarga la página.'
                  : 'Se ha detectado una nueva versión de la aplicación. Por favor, recarga la página para obtener la última versión.'}
              </p>
              {this.state.error?.message && (
                <p className="text-xs text-muted-foreground mt-2 font-mono break-all">
                  {this.state.error.message.substring(0, 200)}
                  {this.state.error.message.length > 200 ? '...' : ''}
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

