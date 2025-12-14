/**
 * Mobile-optimized Privacy Page
 * Optimized for reading on mobile
 */

import { Layout } from "@/layout/Layout";
import { Shield } from "lucide-react";
import { Link } from "wouter";
import { BackButton } from "@/components/common/BackButton";
import { MobilePullToRefresh } from "@/components/mobile";
import { useTrackPageView } from "@/hooks/use-track-view";

export default function MobilePrivacy() {
  useTrackPageView("page", "privacy-mobile");

  return (
    <Layout>
      <MobilePullToRefresh onRefresh={async () => {}}>
        <div className="max-w-full mx-auto space-y-4 py-4 pb-20 px-4">
          {/* Back Button */}
          <div className="flex items-center gap-3">
            <BackButton />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Política de Privacidad</h1>
          </div>

          <div className="prose prose-invert max-w-none space-y-4">
            <section>
              <h2 className="text-lg font-semibold mb-2">1. Responsable del Tratamiento</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                El responsable del tratamiento de los datos personales recabados a través de CodeKit Pro 
                es [Tu Nombre/Empresa], con domicilio en [Tu Dirección] y NIF/CIF [Tu NIF/CIF].
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">2. Datos Recabados</h2>
              <p className="text-muted-foreground leading-relaxed text-sm mb-2">
                CodeKit Pro puede recabar los siguientes tipos de datos personales:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2 text-sm">
                <li>Datos de navegación y uso de la aplicación (almacenados localmente)</li>
                <li>Datos proporcionados voluntariamente al crear prompts, snippets, enlaces o guías</li>
                <li>Datos de cookies y tecnologías similares</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">3. Finalidad del Tratamiento</h2>
              <p className="text-muted-foreground leading-relaxed text-sm mb-2">
                Los datos personales recabados se utilizan para las siguientes finalidades:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2 text-sm">
                <li>Proporcionar y mejorar los servicios de CodeKit Pro</li>
                <li>Personalizar la experiencia del usuario</li>
                <li>Analizar el uso de la aplicación (analytics internos)</li>
                <li>Cumplir con las obligaciones legales aplicables</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">4. Base Jurídica</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                El tratamiento de sus datos personales se basa en el consentimiento del usuario, 
                la ejecución de un contrato y el interés legítimo en mejorar nuestros servicios.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">5. Conservación de Datos</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Los datos personales se conservarán durante el tiempo necesario para cumplir con las 
                finalidades para las que fueron recabados y, en cualquier caso, durante los plazos 
                establecidos por la legislación aplicable.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">6. Derechos del Usuario</h2>
              <p className="text-muted-foreground leading-relaxed text-sm mb-2">
                Usted tiene derecho a acceso, rectificación, supresión, oposición, limitación y portabilidad de sus datos.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">7. Cookies</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                CodeKit Pro utiliza cookies y tecnologías similares para mejorar la experiencia del usuario. 
                Puede gestionar sus preferencias de cookies mediante el banner de cookies.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">8. Seguridad</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                CodeKit Pro adopta las medidas técnicas y organizativas necesarias para garantizar la 
                seguridad de sus datos personales.
              </p>
            </section>

            <section className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Para más información, consulte también nuestro{" "}
                <Link href="/legal" className="text-primary hover:underline">
                  Aviso Legal
                </Link>.
              </p>
            </section>
          </div>
        </div>
      </MobilePullToRefresh>
    </Layout>
  );
}
