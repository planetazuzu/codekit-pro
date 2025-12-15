/**
 * Error boundary component for catching React errors
 * Enhanced with ChunkLoadError detection for PWA deployments
 */

import React, { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isChunkLoadError, getReloadAttemptStatus, handleChunkLoadError } from "@/lib/chunk-error-handler";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  isChunkError: boolean;
  isReloading: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private reloadTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, isChunkError: false, isReloading: false };
  }

  componentWillUnmount() {
    // Clean up timeout if component unmounts
    if (this.reloadTimeoutId) {
      clearTimeout(this.reloadTimeoutId);
      this.reloadTimeoutId = null;
    }
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
    
    // Check global reload state to prevent infinite loops
    const reloadStatus = getReloadAttemptStatus();
    if (reloadStatus.inCooldown) {
      console.warn('Reload already attempted recently, skipping to prevent infinite loop');
      // Mark as reloading to prevent further rendering
      this.setState({ isReloading: true });
      return;
    }

    const errorMessage = error.message || String(error);
    const errorString = String(error).toLowerCase();
    
    // Detect React Error #31 and other critical chunk errors
    const isReactError31 = errorMessage.includes('react error #31') ||
      errorMessage.includes('$$typeof') ||
      (errorMessage.includes('displayName') && errorMessage.includes('render')) ||
      errorMessage.includes('Objects are not valid') ||
      errorString.includes('react error #31');
    
    // Check for chunk errors
    const chunkError = isChunkLoadError(error);
    const isCriticalError = isReactError31 || chunkError.isChunkError;
    
    if (isCriticalError) {
      console.warn('Critical error detected (React Error #31 or ChunkError), initiating reload...');
      
      // Mark state as reloading to prevent rendering
      this.setState({ isReloading: true });
      
      // Clear any existing timeout
      if (this.reloadTimeoutId) {
        clearTimeout(this.reloadTimeoutId);
      }
      
      // Use the centralized handler which manages global state
      // This prevents multiple concurrent reload attempts
      try {
        handleChunkLoadError(error, 0);
      } catch (reloadError) {
        console.error('Failed to initiate reload:', reloadError);
        // Last resort: direct reload without cache clearing
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, isChunkError: false });
  };

  handleReload = () => {
    // Check global reload state to prevent multiple reload attempts
    const reloadStatus = getReloadAttemptStatus();
    if (reloadStatus.inCooldown) {
      console.warn('Reload already attempted, please wait');
      return;
    }

    // Mark as reloading to prevent rendering
    this.setState({ isReloading: true });

    // Clear timeout if exists
    if (this.reloadTimeoutId) {
      clearTimeout(this.reloadTimeoutId);
      this.reloadTimeoutId = null;
    }

    // Use centralized handler
    try {
      handleChunkLoadError(this.state.error || new Error('Manual reload'), 0);
    } catch (reloadError) {
      console.error('Failed to reload:', reloadError);
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  };

  render() {
    // If we're reloading, return null to prevent any rendering
    // This stops React from continuing to render in an error state
    if (this.state.isReloading) {
      return null;
    }

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

