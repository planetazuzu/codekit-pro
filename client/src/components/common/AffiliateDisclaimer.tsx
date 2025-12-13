/**
 * Affiliate Disclaimer Banner
 * Shows a notice about affiliate links at the bottom of the page
 */

import { useState, useEffect } from "react";
import { Info, ExternalLink, X } from "lucide-react";
import { Link } from "wouter";
import { storageService } from "@/services/storage.service";

const COOKIE_CONSENT_KEY = "cookie_consent";
const AFFILIATE_BANNER_KEY = "affiliate_banner_dismissed";

export function AffiliateDisclaimer() {
  const [cookieBannerVisible, setCookieBannerVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if banner was dismissed
    const dismissed = storageService.get<boolean>(AFFILIATE_BANNER_KEY);
    setIsVisible(!dismissed);

    // Check if cookie banner is visible
    const checkCookieBanner = () => {
      const cookieConsent = storageService.get<{ accepted: boolean }>(COOKIE_CONSENT_KEY);
      setCookieBannerVisible(!cookieConsent?.accepted);
    };

    checkCookieBanner();
    // Check periodically in case cookie consent changes (reducido a 2s para mejor rendimiento)
    const interval = setInterval(checkCookieBanner, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    storageService.set(AFFILIATE_BANNER_KEY, true);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed left-0 md:left-64 right-0 z-40 border-t border-border/50 bg-card/95 backdrop-blur-sm transition-all duration-300 ${
        cookieBannerVisible ? 'bottom-[200px] md:bottom-[200px]' : 'bottom-[80px] md:bottom-[80px]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 md:px-8 py-2">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap flex-1 min-w-0">
            <Info className="h-3 w-3 text-blue-400 flex-shrink-0" />
            <span className="flex-1 min-w-0 text-xs leading-tight">
              <span className="hidden md:inline">Esta aplicación contiene{" "}</span>
              <span className="md:hidden">Contiene{" "}</span>
              <Link 
                href="/deals"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                enlaces de afiliados
                <ExternalLink className="h-3 w-3" />
              </Link>
              {" "}
              <span className="hidden md:inline">que pueden generar comisiones.{" "}</span>
              <Link 
                href="/privacy"
                className="text-primary hover:underline"
              >
                Más info
              </Link>
            </span>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            aria-label="Cerrar banner"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

