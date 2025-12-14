/**
 * Mobile-optimized Legal Page
 * Optimized for reading on mobile
 */

import { Layout } from "@/layout/Layout";
import { FileText } from "lucide-react";
import { BackButton } from "@/components/common/BackButton";
import { MobilePullToRefresh } from "@/components/mobile";
import { useTrackPageView } from "@/hooks/use-track-view";

export default function MobileLegal() {
  useTrackPageView("page", "legal-mobile");

  return (
    <Layout>
      <MobilePullToRefresh onRefresh={async () => {}}>
        <div className="max-w-full mx-auto space-y-4 py-4 pb-20 px-4">
          {/* Back Button */}
          <div className="flex items-center gap-3">
            <BackButton />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Aviso Legal</h1>
          </div>

          <div className="prose prose-invert max-w-none space-y-4">
            <section>
              <h2 className="text-lg font-semibold mb-2">1. Información General</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                El presente aviso legal regula el uso del sitio web CodeKit Pro (en adelante, "el Sitio"), 
                propiedad de [Tu Nombre/Empresa], con domicilio en [Tu Dirección] y NIF/CIF [Tu NIF/CIF].
              </p>
              <p className="text-muted-foreground leading-relaxed text-sm">
                El acceso y uso del Sitio implica la aceptación expresa y sin reservas de todas las 
                disposiciones incluidas en este Aviso Legal.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">2. Condiciones de Uso</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                El usuario se compromete a utilizar el Sitio de conformidad con la ley, el presente 
                Aviso Legal, las buenas costumbres y el orden público.
              </p>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Queda prohibido el uso del Sitio con fines ilícitos o no autorizados, o de forma que 
                pueda dañar, impedir, sobrecargar o deteriorar el Sitio.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">3. Propiedad Intelectual</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Todos los contenidos del Sitio, incluyendo textos, gráficos, logotipos, iconos, imágenes, 
                archivos de audio, descargas digitales y compilaciones de datos, son propiedad de 
                CodeKit Pro o de sus proveedores de contenido y están protegidos por las leyes de 
                propiedad intelectual e industrial.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">4. Enlaces de Afiliados</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                CodeKit Pro puede contener enlaces de afiliados a sitios web de terceros. Estos enlaces 
                son proporcionados únicamente para su conveniencia y no constituyen una aprobación del 
                contenido de dichos sitios web.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">5. Limitación de Responsabilidad</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                CodeKit Pro no se hace responsable de los daños y perjuicios de toda naturaleza que 
                puedan deberse a la falta de disponibilidad, continuidad, calidad o utilidad de los 
                contenidos y servicios ofrecidos en el Sitio.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">6. Modificaciones</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                CodeKit Pro se reserva el derecho de modificar, en cualquier momento y sin previo aviso, 
                la presentación, configuración, información y servicios ofrecidos en el Sitio.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">7. Legislación Aplicable</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                El presente Aviso Legal se rige por la legislación española. Para cualquier controversia 
                que pudiera derivarse del acceso o uso del Sitio, las partes se someten a los juzgados 
                y tribunales del domicilio del usuario.
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
            </section>
          </div>
        </div>
      </MobilePullToRefresh>
    </Layout>
  );
}
