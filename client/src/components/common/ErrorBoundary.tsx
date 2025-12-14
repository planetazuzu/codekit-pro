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
  private reloadTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private hasAttemptedReload = false;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, isChunkError: false };
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
    
    // CRITICAL: Auto-reload on React Error #31 (invalid component rendering)
    // Only attempt reload once to prevent infinite loops
    if (this.hasAttemptedReload) {
      console.warn('Reload already attempted, skipping to prevent infinite loop');
      return;
    }

    const errorMessage = error.message || String(error);
    const isReactError31 = errorMessage.includes('react error #31') ||
      errorMessage.includes('$$typeof') ||
      (errorMessage.includes('displayName') && errorMessage.includes('render')) ||
      errorMessage.includes('Objects are not valid');
    
    if (isReactError31) {
      this.hasAttemptedReload = true;
      console.warn('React Error #31 detected, auto-reloading page immediately...');
      
      // Clear any existing timeout
      if (this.reloadTimeoutId) {
        clearTimeout(this.reloadTimeoutId);
      }
      
      // Immediate reload to break the error loop
      // Use a small timeout to allow React to finish error handling
      this.reloadTimeoutId = setTimeout(() => {
        try {
          // Unregister service worker first to prevent serving stale chunks
          if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
              registrations.forEach(reg => {
                reg.unregister().catch(() => {});
              });
              // Clear caches and reload
              if ('caches' in window) {
                caches.keys().then(cacheNames => {
                  cacheNames.forEach(cacheName => {
                    caches.delete(cacheName).catch(() => {});
                  });
                }).finally(() => {
                  window.location.href = window.location.href.split('#')[0] + '?reload=' + Date.now();
                });
              } else {
                window.location.href = window.location.href.split('#')[0] + '?reload=' + Date.now();
              }
            }).catch(() => {
              // If SW unregister fails, just reload
              window.location.href = window.location.href.split('#')[0] + '?reload=' + Date.now();
            });
          } else {
            // No SW, just clear cache and reload
            if ('caches' in window) {
              caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => {
                  caches.delete(cacheName).catch(() => {});
                });
              }).finally(() => {
                window.location.href = window.location.href.split('#')[0] + '?reload=' + Date.now();
              });
            } else {
              window.location.href = window.location.href.split('#')[0] + '?reload=' + Date.now();
            }
          }
        } catch (reloadError) {
          console.error('Failed to reload:', reloadError);
          // Force reload as last resort
          window.location.reload();
        }
      }, 100);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, isChunkError: false });
  };

  handleReload = () => {
    // Prevent multiple reload attempts
    if (this.hasAttemptedReload) {
      return;
    }
    this.hasAttemptedReload = true;

    // Clear timeout if exists
    if (this.reloadTimeoutId) {
      clearTimeout(this.reloadTimeoutId);
      this.reloadTimeoutId = null;
    }

    // Unregister service worker and clear caches
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(reg => {
          reg.unregister().catch(() => {});
        });
        // Clear caches and reload
        if ('caches' in window) {
          caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
              caches.delete(cacheName).catch(() => {});
            });
          }).finally(() => {
            window.location.href = window.location.href.split('#')[0] + '?reload=' + Date.now();
          });
        } else {
          window.location.href = window.location.href.split('#')[0] + '?reload=' + Date.now();
        }
      }).catch(() => {
        // If SW unregister fails, just reload
        window.location.href = window.location.href.split('#')[0] + '?reload=' + Date.now();
      });
    } else {
      // No SW, just clear cache and reload
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName).catch(() => {});
          });
        }).finally(() => {
          window.location.href = window.location.href.split('#')[0] + '?reload=' + Date.now();
        });
      } else {
        window.location.href = window.location.href.split('#')[0] + '?reload=' + Date.now();
      }
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

