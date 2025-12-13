/**
 * Legal Notice Page
 */

import { Layout } from "@/layout/Layout";
import { FileText } from "lucide-react";
import { BackButton } from "@/components/common/BackButton";

import { MobilePullToRefresh, MobileOnly, DesktopOnly } from "@/components/mobile";

export default function Legal() {
  return (
    <Layout>
      <MobilePullToRefresh onRefresh={async () => {}}>
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-8 py-4 md:py-8 px-4">
          {/* Back Button */}
          <div className="flex items-center gap-4">
            <BackButton />
          </div>

          <div className="flex items-center gap-3 mb-4 md:mb-8">
            <FileText className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <h1 className="text-xl md:text-3xl font-bold">Aviso Legal</h1>
          </div>

          <div className="prose prose-invert max-w-none space-y-4 md:space-y-6">
          <section>
            <h2 className="text-lg md:text-2xl font-semibold mb-2 md:mb-4">1. Información General</h2>
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
              El presente aviso legal regula el uso del sitio web CodeKit Pro (en adelante, "el Sitio"), 
              propiedad de [Tu Nombre/Empresa], con domicilio en [Tu Dirección] y NIF/CIF [Tu NIF/CIF].
            </p>
            <p className="text-muted-foreground leading-relaxed">
              El acceso y uso del Sitio implica la aceptación expresa y sin reservas de todas las 
              disposiciones incluidas en este Aviso Legal.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Condiciones de Uso</h2>
            <p className="text-muted-foreground leading-relaxed">
              El usuario se compromete a utilizar el Sitio de conformidad con la ley, el presente 
              Aviso Legal, las buenas costumbres y el orden público.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Queda prohibido el uso del Sitio con fines ilícitos o no autorizados, o de forma que 
              pueda dañar, impedir, sobrecargar o deteriorar el Sitio o impedir la normal utilización 
              o disfrute del mismo por parte de otros usuarios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Propiedad Intelectual</h2>
            <p className="text-muted-foreground leading-relaxed">
              Todos los contenidos del Sitio, incluyendo textos, gráficos, logotipos, iconos, imágenes, 
              archivos de audio, descargas digitales y compilaciones de datos, son propiedad de 
              CodeKit Pro o de sus proveedores de contenido y están protegidos por las leyes de 
              propiedad intelectual e industrial.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Queda prohibida la reproducción, distribución, comunicación pública y transformación 
              de los contenidos del Sitio sin el consentimiento previo y por escrito del titular.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Enlaces de Afiliados</h2>
            <p className="text-muted-foreground leading-relaxed">
              CodeKit Pro puede contener enlaces de afiliados a sitios web de terceros. Estos enlaces 
              son proporcionados únicamente para su conveniencia y no constituyen una aprobación del 
              contenido de dichos sitios web.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              CodeKit Pro no se hace responsable del contenido, políticas de privacidad o prácticas 
              de los sitios web de terceros a los que se enlaza.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Limitación de Responsabilidad</h2>
            <p className="text-muted-foreground leading-relaxed">
              CodeKit Pro no se hace responsable de los daños y perjuicios de toda naturaleza que 
              puedan deberse a la falta de disponibilidad, continuidad, calidad o utilidad de los 
              contenidos y servicios ofrecidos en el Sitio.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              El usuario es el único responsable de la veracidad y licitud de los datos que 
              introduzca en el Sitio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Modificaciones</h2>
            <p className="text-muted-foreground leading-relaxed">
              CodeKit Pro se reserva el derecho de modificar, en cualquier momento y sin previo aviso, 
              la presentación, configuración, información y servicios ofrecidos en el Sitio, así como 
              el presente Aviso Legal.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Legislación Aplicable</h2>
            <p className="text-muted-foreground leading-relaxed">
              El presente Aviso Legal se rige por la legislación española. Para cualquier controversia 
              que pudiera derivarse del acceso o uso del Sitio, las partes se someten a los juzgados 
              y tribunales del domicilio del usuario.
            </p>
          </section>

          <section className="pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
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

