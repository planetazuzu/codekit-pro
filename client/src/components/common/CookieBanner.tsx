/**
 * Cookie Consent Banner
 */

import { useState, useEffect } from "react";
import { Cookie, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { storageService } from "@/services/storage.service";

const COOKIE_CONSENT_KEY = "cookie_consent";
const COOKIE_PREFERENCES_KEY = "cookie_preferences";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already given consent
    const consent = storageService.get<{ accepted: boolean; date: string }>(COOKIE_CONSENT_KEY);
    if (!consent?.accepted) {
      setShowBanner(true);
    } else {
      // Load saved preferences
      const savedPrefs = storageService.get<CookiePreferences>(COOKIE_PREFERENCES_KEY);
      if (savedPrefs) {
        setPreferences(savedPrefs);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allAccepted);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    savePreferences(onlyNecessary);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowBanner(false);
    setShowSettings(false);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    storageService.set(COOKIE_CONSENT_KEY, {
      accepted: true,
      date: new Date().toISOString(),
    });
    storageService.set(COOKIE_PREFERENCES_KEY, prefs);
    
    // Apply preferences (e.g., enable/disable analytics)
    // Analytics preference saved to localStorage
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-64 right-0 z-50 p-4 bg-[#161B22] border-t border-white/10 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-foreground mb-1">
                <strong>Utilizamos cookies</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                Utilizamos cookies para mejorar su experiencia, analizar el tráfico del sitio y 
                personalizar el contenido. Al hacer clic en "Aceptar todas", acepta nuestro uso de cookies.{" "}
                <button
                  onClick={() => setShowSettings(true)}
                  className="text-primary hover:underline"
                >
                  Configurar preferencias
                </button>
                {" o "}
                <a href="/privacy" className="text-primary hover:underline">
                  leer más
                </a>
                .
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="whitespace-nowrap"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRejectAll}
              className="whitespace-nowrap"
            >
              Rechazar
            </Button>
            <Button
              size="sm"
              onClick={handleAcceptAll}
              className="whitespace-nowrap bg-primary text-primary-foreground"
            >
              Aceptar todas
            </Button>
          </div>
        </div>
      </div>

      {/* Cookie Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5" />
              Preferencias de Cookies
            </DialogTitle>
            <DialogDescription>
              Gestiona tus preferencias de cookies. Puedes activar o desactivar diferentes tipos de cookies.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Necessary Cookies */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex-1">
                <Label htmlFor="necessary" className="text-base font-semibold cursor-pointer">
                  Cookies Necesarias
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Estas cookies son esenciales para el funcionamiento del sitio web y no se pueden desactivar.
                </p>
              </div>
              <Switch
                id="necessary"
                checked={preferences.necessary}
                disabled
                className="ml-4"
              />
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex-1">
                <Label htmlFor="analytics" className="text-base font-semibold cursor-pointer">
                  Cookies de Análisis
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web recopilando 
                  información de forma anónima.
                </p>
              </div>
              <Switch
                id="analytics"
                checked={preferences.analytics}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, analytics: checked }))
                }
                className="ml-4"
              />
            </div>

            {/* Marketing Cookies */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex-1">
                <Label htmlFor="marketing" className="text-base font-semibold cursor-pointer">
                  Cookies de Marketing
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Se utilizan para hacer seguimiento de los visitantes a través de diferentes sitios web 
                  con la intención de mostrar anuncios relevantes.
                </p>
              </div>
              <Switch
                id="marketing"
                checked={preferences.marketing}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, marketing: checked }))
                }
                className="ml-4"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePreferences}>
              Guardar Preferencias
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

