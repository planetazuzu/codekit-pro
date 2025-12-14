/**
 * Mobile-optimized AffiliateLanding Page
 * Single column layout optimized for mobile
 */

import { useMemo } from "react";
import { useRoute } from "wouter";
import { Helmet } from "react-helmet-async";
import {
  ExternalLink,
  CheckCircle,
  Star,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Layout } from "@/layout/Layout";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { BackButton } from "@/components/common/BackButton";
import { AffiliateRecommendations } from "@/components/affiliates/AffiliateRecommendations";
import { useAffiliates, useTrackAffiliateClick } from "@/hooks/use-affiliates";
import { buildAffiliateUrl } from "@/lib/affiliate-utils";
import { MobilePullToRefresh, MobileShareSheet } from "@/components/mobile";
import { useTrackPageView } from "@/hooks/use-track-view";

const CATEGORY_BENEFITS: Record<string, string[]> = {
  Hosting: [
    "99.9% uptime garantizado",
    "SSL gratuito incluido",
    "Soporte 24/7 en español",
    "Backups automáticos",
    "Panel de control intuitivo",
  ],
  Deployment: [
    "Deploy en segundos",
    "Integración con Git",
    "Preview deployments",
    "Edge network global",
    "Escala automáticamente",
  ],
  Cloud: [
    "Infraestructura escalable",
    "Pago por uso",
    "Alta disponibilidad",
    "APIs completas",
    "Múltiples regiones",
  ],
  IA: [
    "Acelera tu desarrollo 10x",
    "Autocompletado inteligente",
    "Genera código automáticamente",
    "Aprende de tu estilo",
    "Integración con IDE",
  ],
  "IA & DevTools": [
    "Entorno de desarrollo en la nube",
    "Colaboración en tiempo real",
    "Ejecuta código al instante",
    "Multiplataforma",
    "Gratis para empezar",
  ],
  "UI Kits": [
    "Componentes production-ready",
    "Diseños profesionales",
    "Totalmente personalizables",
    "Documentación completa",
    "Actualizaciones de por vida",
  ],
  Productividad: [
    "Organiza tu trabajo",
    "Colaboración en equipo",
    "Plantillas incluidas",
    "Integraciones con otras apps",
    "Sincronización en tiempo real",
  ],
  Diseño: [
    "Herramientas profesionales",
    "Miles de templates",
    "Fácil de usar",
    "Exporta en cualquier formato",
    "Colaboración en equipo",
  ],
};

export default function MobileAffiliateLanding() {
  useTrackPageView("page", "affiliate-landing-mobile");
  const [, params] = useRoute("/tools/:slug");
  const slug = params?.slug;
  
  const { data: affiliates, isLoading } = useAffiliates();
  const trackClick = useTrackAffiliateClick();

  const affiliate = useMemo(() => {
    if (!affiliates || !slug) return null;
    return affiliates.find(
      (a) => a.name.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase()
    );
  }, [affiliates, slug]);

  const benefits = useMemo(() => {
    if (!affiliate) return [];
    return CATEGORY_BENEFITS[affiliate.category] || [
      "Herramienta profesional",
      "Fácil de usar",
      "Soporte incluido",
      "Actualizaciones frecuentes",
      "Comunidad activa",
    ];
  }, [affiliate]);

  const handleClick = async () => {
    if (!affiliate) return;
    
    try {
      await trackClick.mutateAsync(affiliate.id);
      const finalUrl = buildAffiliateUrl(affiliate, "codekit", "landing", affiliate.name.toLowerCase());
      window.open(finalUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      window.open(affiliate.url, "_blank", "noopener,noreferrer");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  if (!affiliate) {
    return (
      <Layout>
        <EmptyState
          icon={ExternalLink}
          title="Herramienta no encontrada"
          description="No se encontró la herramienta que buscas."
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{affiliate.name} - Descuento Exclusivo | CodeKit Pro</title>
        <meta
          name="description"
          content={`Obtén ${affiliate.name} con descuento exclusivo. ${affiliate.code ? `Código: ${affiliate.code}` : ""}`}
        />
      </Helmet>

      <MobilePullToRefresh onRefresh={async () => {}}>
        <div className="max-w-full mx-auto space-y-4 pb-20 px-4">
          {/* Back Button */}
          <div className="flex items-center gap-3">
            <BackButton />
            <MobileShareSheet
              title={`Compartir ${affiliate.name}`}
              url={window.location.href}
              text={`¡Descubre ${affiliate.name}! ${affiliate.code ? `Código: ${affiliate.code}` : ""}`}
            />
          </div>

          {/* Hero */}
          <div className="text-center space-y-4 py-4">
            <Badge variant="secondary" className="text-xs">
              {affiliate.category}
            </Badge>
            
            <h1 className="text-2xl font-bold">
              {affiliate.name}
            </h1>
          
            <p className="text-base text-muted-foreground">
              La mejor herramienta de {affiliate.category.toLowerCase()} para desarrolladores.
            </p>

            {/* Commission/Discount highlight */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {affiliate.commission && (
                <Badge className="text-sm py-1.5 px-3 bg-green-500/10 text-green-400 border-green-500/20">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Comisión: {affiliate.commission}
                </Badge>
              )}
              {affiliate.code && (
                <Badge className="text-sm py-1.5 px-3 bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                  <Star className="h-3.5 w-3.5 mr-1.5" />
                  Código: {affiliate.code}
                </Badge>
              )}
            </div>

            {/* CTA Button */}
            <Button
              size="lg"
              onClick={handleClick}
              className="w-full text-base px-6 py-5 bg-blue-600 hover:bg-blue-700"
            >
              Obtener {affiliate.name} ahora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Benefits */}
          <Card className="bg-card/50">
            <CardContent className="pt-4">
              <h2 className="text-lg font-semibold mb-3 text-center">
                ¿Por qué elegir {affiliate.name}?
              </h2>
              <div className="space-y-2.5">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-2.5">
                    <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Secondary CTA */}
          <div className="text-center p-6 rounded-xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10">
            <h3 className="text-xl font-bold mb-2">
              ¿Listo para empezar?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Únete a miles de desarrolladores que ya usan {affiliate.name}
            </p>
            <Button onClick={handleClick} size="lg" variant="outline" className="w-full">
              <ExternalLink className="mr-2 h-4 w-4" />
              Ir a {affiliate.name}
            </Button>
          </div>

          {/* Related tools */}
          <div className="pt-6 border-t border-border">
            <h3 className="text-base font-semibold mb-3">
              Herramientas relacionadas
            </h3>
            <AffiliateRecommendations
              context="tool"
              category={affiliate.category}
              limit={3}
            />
          </div>
        </div>
      </MobilePullToRefresh>
    </Layout>
  );
}
