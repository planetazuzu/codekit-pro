/**
 * Chunk Load Error Handler
 * Detects and handles ChunkLoadError from dynamic imports
 * Common after redeployments in PWAs
 */

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
 */
export function handleChunkLoadError(error: unknown, retryCount: number = 0): void {
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

  // If we've already retried, do a hard reload
  if (retryCount >= maxRetries) {
    console.warn('Max retries reached, forcing page reload');
    // Clear all caches and reload
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
    return;
  }

  // First retry: wait a bit and try reloading
  // This gives time for the service worker to update
  setTimeout(() => {
    console.log(`Retrying chunk load (attempt ${retryCount + 1}/${maxRetries})...`);
    window.location.reload();
  }, 1000 * (retryCount + 1)); // Exponential backoff: 1s, 2s
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
