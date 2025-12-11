/**
 * Sales Banner Component
 * Promotional banner for selling the application
 */

import { useState, useEffect } from "react";
import { X, ShoppingCart, Code, Sparkles, Mail, Phone } from "lucide-react";
import { storageService } from "@/services/storage.service";

const SALES_BANNER_KEY = "sales_banner_dismissed";

export function SalesBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed
    const dismissed = storageService.get<boolean>(SALES_BANNER_KEY);
    setIsVisible(!dismissed);
  }, []);

  const handleDismiss = () => {
    storageService.set(SALES_BANNER_KEY, true);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-64 right-0 z-50 border-t border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 backdrop-blur-sm shadow-lg">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground mb-1">
                ¿Te gusta esta aplicación? ¡Está disponible para compra!
              </h3>
              <p className="text-xs text-muted-foreground">
                CodeKit Pro está en venta. Incluye código fuente completo, documentación, base de datos PostgreSQL, integración Stripe, sistema de usuarios y más. <strong>Contacta ahora para más información.</strong>
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <a
                href="mailto:iafactorystudio@proton.me?subject=Interesado en comprar CodeKit Pro&body=Hola,%0D%0A%0D%0AEstoy interesado en adquirir CodeKit Pro. Por favor, envíame más información sobre:%0D%0A- Precio%0D%0A- Qué incluye%0D%0A- Forma de pago%0D%0A- Soporte incluido%0D%0A%0D%0AGracias"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Mail className="h-4 w-4" />
                Email
              </a>
              <a
                href="tel:+34642082016"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-primary/20 bg-background text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
              >
                <Phone className="h-4 w-4" />
                +34 642 082 016
              </a>
              <button
                onClick={handleDismiss}
                className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Cerrar banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

