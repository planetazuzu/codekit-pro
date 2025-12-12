/**
 * Image Optimization Utilities
 * Optimización de imágenes para móvil
 */

/**
 * Generate responsive image srcset
 */
export function generateSrcSet(
  baseUrl: string,
  sizes: number[] = [320, 640, 768, 1024, 1280]
): string {
  return sizes
    .map((size) => `${baseUrl}?w=${size} ${size}w`)
    .join(", ");
}

/**
 * Get optimal image size for mobile
 */
export function getMobileImageSize(width: number): number {
  if (width <= 320) return 320;
  if (width <= 640) return 640;
  if (width <= 768) return 768;
  return 1024;
}

/**
 * Lazy load image with intersection observer
 */
export function lazyLoadImage(
  img: HTMLImageElement,
  src: string,
  onLoad?: () => void
) {
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            img.src = src;
            if (onLoad) {
              img.onload = onLoad;
            }
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: "50px" }
    );
    observer.observe(img);
  } else {
    // Fallback for browsers without IntersectionObserver
    img.src = src;
    if (onLoad) {
      img.onload = onLoad;
    }
  }
}

/**
 * Convert image to WebP format (if supported)
 */
export function getOptimalImageFormat(): "webp" | "jpg" | "png" {
  if (typeof document === "undefined") return "jpg";
  
  const canvas = document.createElement("canvas");
  const supportsWebP = canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
  
  return supportsWebP ? "webp" : "jpg";
}

