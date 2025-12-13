/**
 * Privacy Policy Page
 */

import { Layout } from "@/layout/Layout";
import { Shield } from "lucide-react";
import { Link } from "wouter";
import { BackButton } from "@/components/common/BackButton";
import { MobilePullToRefresh, MobileOnly, DesktopOnly } from "@/components/mobile";

export default function Privacy() {
  return (
    <Layout>
      <MobilePullToRefresh onRefresh={async () => {}}>
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-8 py-4 md:py-8 px-4">
          {/* Back Button */}
          <div className="flex items-center gap-4">
            <BackButton />
          </div>

          <div className="flex items-center gap-3 mb-4 md:mb-8">
            <Shield className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <h1 className="text-xl md:text-3xl font-bold">Política de Privacidad</h1>
          </div>

          <div className="prose prose-invert max-w-none space-y-4 md:space-y-6">
            <section>
              <h2 className="text-lg md:text-2xl font-semibold mb-2 md:mb-4">1. Responsable del Tratamiento</h2>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
              El responsable del tratamiento de los datos personales recabados a través de CodeKit Pro 
              es [Tu Nombre/Empresa], con domicilio en [Tu Dirección] y NIF/CIF [Tu NIF/CIF].
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Puede contactar con nosotros en [Tu Email] para cualquier cuestión relacionada con el 
              tratamiento de sus datos personales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Datos Recabados</h2>
            <p className="text-muted-foreground leading-relaxed">
              CodeKit Pro puede recabar los siguientes tipos de datos personales:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Datos de navegación y uso de la aplicación (almacenados localmente)</li>
              <li>Datos proporcionados voluntariamente al crear prompts, snippets, enlaces o guías</li>
              <li>Datos de cookies y tecnologías similares (ver sección de Cookies)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Los datos se almacenan principalmente en el navegador del usuario mediante LocalStorage 
              y no se transmiten a servidores externos sin su consentimiento explícito.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Finalidad del Tratamiento</h2>
            <p className="text-muted-foreground leading-relaxed">
              Los datos personales recabados se utilizan para las siguientes finalidades:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Proporcionar y mejorar los servicios de CodeKit Pro</li>
              <li>Personalizar la experiencia del usuario</li>
              <li>Analizar el uso de la aplicación (analytics internos)</li>
              <li>Cumplir con las obligaciones legales aplicables</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Base Jurídica</h2>
            <p className="text-muted-foreground leading-relaxed">
              El tratamiento de sus datos personales se basa en:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>El consentimiento del usuario para el uso de cookies y tecnologías de seguimiento</li>
              <li>La ejecución de un contrato o medidas precontractuales</li>
              <li>El interés legítimo en mejorar nuestros servicios</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Conservación de Datos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Los datos personales se conservarán durante el tiempo necesario para cumplir con las 
              finalidades para las que fueron recabados y, en cualquier caso, durante los plazos 
              establecidos por la legislación aplicable.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Los datos almacenados localmente en el navegador pueden eliminarse en cualquier momento 
              por el usuario mediante las opciones de su navegador.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Derechos del Usuario</h2>
            <p className="text-muted-foreground leading-relaxed">
              Usted tiene derecho a:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Acceso:</strong> Obtener información sobre sus datos personales</li>
              <li><strong>Rectificación:</strong> Solicitar la corrección de datos inexactos</li>
              <li><strong>Supresión:</strong> Solicitar la eliminación de sus datos</li>
              <li><strong>Oposición:</strong> Oponerse al tratamiento de sus datos</li>
              <li><strong>Limitación:</strong> Solicitar la limitación del tratamiento</li>
              <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Para ejercer estos derechos, puede contactarnos en [Tu Email] o utilizar las funciones 
              de exportación/eliminación disponibles en la aplicación.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Cookies y Tecnologías Similares</h2>
            <p className="text-muted-foreground leading-relaxed">
              CodeKit Pro utiliza cookies y tecnologías similares para mejorar la experiencia del usuario. 
              Puede gestionar sus preferencias de cookies mediante el banner de cookies que aparece 
              en su primera visita.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Para más información, consulte nuestra{" "}
              <Link href="/privacy#cookies" className="text-primary hover:underline">
                política de cookies
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Seguridad</h2>
            <p className="text-muted-foreground leading-relaxed">
              CodeKit Pro adopta las medidas técnicas y organizativas necesarias para garantizar la 
              seguridad de sus datos personales y evitar su alteración, pérdida, tratamiento o acceso 
              no autorizado.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Transferencias Internacionales</h2>
            <p className="text-muted-foreground leading-relaxed">
              Los datos almacenados localmente en su navegador no se transfieren a servidores externos 
              sin su consentimiento. En caso de utilizar servicios de terceros (como analytics), 
              estos pueden estar ubicados fuera del Espacio Económico Europeo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Modificaciones</h2>
            <p className="text-muted-foreground leading-relaxed">
              CodeKit Pro se reserva el derecho de modificar esta Política de Privacidad. Las 
              modificaciones serán publicadas en esta página con la fecha de última actualización.
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
            <p className="text-sm text-muted-foreground mt-2">
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

