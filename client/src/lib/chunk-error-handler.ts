/**
 * Chunk Load Error Handler
 * Detects and handles ChunkLoadError from dynamic imports
 * Common after redeployments in PWAs
 */

// Global reload state using sessionStorage to persist across component instances
const RELOAD_STATE_KEY = '__ckp_reload_attempted';
const RELOAD_COOLDOWN_KEY = '__ckp_reload_cooldown';
const RELOAD_COOLDOWN_MS = 5000; // 5 second cooldown between reload attempts

/**
 * Check if a reload has been attempted recently (within cooldown period)
 */
function hasRecentReloadAttempt(): boolean {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return false;
  }
  
  const cooldown = sessionStorage.getItem(RELOAD_COOLDOWN_KEY);
  if (!cooldown) {
    return false;
  }
  
  const cooldownTime = parseInt(cooldown, 10);
  const now = Date.now();
  
  // If cooldown has passed, clear it
  if (now - cooldownTime > RELOAD_COOLDOWN_MS) {
    sessionStorage.removeItem(RELOAD_COOLDOWN_KEY);
    sessionStorage.removeItem(RELOAD_STATE_KEY);
    return false;
  }
  
  return true;
}

/**
 * Mark that a reload has been attempted
 */
function markReloadAttempted(): void {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return;
  }
  sessionStorage.setItem(RELOAD_STATE_KEY, 'true');
  sessionStorage.setItem(RELOAD_COOLDOWN_KEY, Date.now().toString());
}

/**
 * Check if reload has been attempted (within current session)
 */
function hasReloadBeenAttempted(): boolean {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return false;
  }
  return sessionStorage.getItem(RELOAD_STATE_KEY) === 'true' || hasRecentReloadAttempt();
}

export interface ChunkError {
  isChunkError: boolean;
  chunkName?: string;
  shouldReload: boolean;
}

/**
 * Detects if an error is a ChunkLoadError or React Error #31
 * Common patterns:
 * - "Failed to fetch dynamically imported module"
 * - "Loading chunk X failed"
 * - "ChunkLoadError"
 * - Network errors when loading .js files
 * - React Error #31 (objects with $$typeof, render, displayName)
 */
export function isChunkLoadError(error: unknown): ChunkError {
  if (!error) {
    return { isChunkError: false, shouldReload: false };
  }

  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorString = String(error).toLowerCase();

  // Patterns that indicate chunk loading errors or React Error #31
  const chunkErrorPatterns = [
    'failed to fetch dynamically imported module',
    'loading chunk',
    'chunkloaderror',
    'failed to load',
    'loading css chunk',
    'importing a module script failed',
    'net::err_failed',
    'networkerror',
    'minified react error #31',
    'react error #31',
    'objects are not valid as a react child',
    '$$typeof',
    'render',
    'displayName',
    'missing default export',
    'default export is not a component',
    'invalid module',
  ];

  // Check if error matches chunk error patterns
  const isChunkError = chunkErrorPatterns.some(pattern => 
    errorString.includes(pattern) || errorMessage.toLowerCase().includes(pattern)
  );

  // Also check for React Error #31 specifically
  const isReactError31 = errorString.includes('react error #31') ||
    (errorString.includes('$$typeof') && errorString.includes('displayname'));

  if (!isChunkError && !isReactError31) {
    return { isChunkError: false, shouldReload: false };
  }

  // Extract chunk name if possible
  const chunkMatch = errorMessage.match(/(?:chunk|module|file)\s+([^\s]+)/i) ||
                     errorString.match(/([a-z0-9-]+\.js)/i);
  const chunkName = chunkMatch ? chunkMatch[1] : undefined;

  return {
    isChunkError: true,
    chunkName,
    shouldReload: true, // Chunk errors and React Error #31 require page reload
  };
}

/**
 * Handles chunk load error by reloading the page
 * This gets the new chunks from the server after a redeploy
 * Uses global state to prevent infinite reload loops
 */
export function handleChunkLoadError(error: unknown, retryCount: number = 0): void {
  // Check if we've already attempted a reload recently
  if (hasRecentReloadAttempt()) {
    console.warn('Reload already attempted recently, skipping to prevent infinite loop');
    return;
  }
  
  const maxRetries = 2;
  
  const chunkError = isChunkLoadError(error);
  
  if (!chunkError.isChunkError) {
    // Not a chunk error, rethrow
    throw error;
  }

  console.warn('ChunkLoadError detected:', {
    message: error instanceof Error ? error.message : String(error),
    chunkName: chunkError.chunkName,
    retryCount,
  });

  // Mark reload attempt immediately to prevent concurrent calls
  markReloadAttempted();

  // Force immediate reload - don't wait, don't retry
  // Clear caches and reload synchronously as much as possible
  if (typeof window === 'undefined') {
    return;
  }

  // Use a more direct reload approach
  const reloadPage = () => {
    try {
      // Clear caches first (fire and forget)
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName).catch(() => {});
          });
        }).catch(() => {});
      }
      
      // Unregister service workers (fire and forget)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(reg => {
            reg.unregister().catch(() => {});
          });
        }).catch(() => {});
      }
      
      // Force reload using replace to avoid history issues
      // Split URL to remove hash and query params, then add reload param
      const baseUrl = window.location.origin + window.location.pathname;
      window.location.replace(baseUrl + '?reload=' + Date.now());
    } catch (reloadError) {
      console.error('Failed to reload:', reloadError);
      // Last resort: direct reload
      window.location.reload();
    }
  };

  // If max retries reached or first critical error, reload immediately
  if (retryCount >= maxRetries || chunkError.isChunkError) {
    console.warn('Forcing immediate page reload');
    reloadPage();
    return;
  }

  // For retries, use a short delay
  setTimeout(() => {
    console.log(`Retrying chunk load (attempt ${retryCount + 1}/${maxRetries})...`);
    reloadPage();
  }, 1000 * (retryCount + 1));
}

/**
 * Check if a reload has been attempted (for ErrorBoundary use)
 */
export function getReloadAttemptStatus(): { attempted: boolean; inCooldown: boolean } {
  return {
    attempted: hasReloadBeenAttempted(),
    inCooldown: hasRecentReloadAttempt(),
  };
}

/**
 * Wrapper for dynamic imports that handles chunk errors
 */
export async function safeDynamicImport<T>(
  importFn: () => Promise<T>,
  retryCount: number = 0
): Promise<T> {
  try {
    return await importFn();
  } catch (error) {
    const chunkError = isChunkLoadError(error);
    
    if (chunkError.isChunkError && retryCount < 2) {
      // Wait before retry to allow SW to update
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return safeDynamicImport(importFn, retryCount + 1);
    }
    
    // If still error after retries, handle it
    handleChunkLoadError(error, retryCount);
    throw error; // Re-throw if handleChunkLoadError didn't reload
  }
}
