/**
 * Individual Affiliate Landing Page
 * SEO optimized landing for each affiliate
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
import { MobilePullToRefresh, MobileShareSheet, MobileOnly, DesktopOnly } from "@/components/mobile";

// Benefits by category
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

export default function AffiliateLanding() {
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
      // Error tracking click - silently fail to avoid disrupting UX
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
        <meta name="keywords" content={`${affiliate.name}, ${affiliate.category}, descuento, oferta, código promocional`} />
      </Helmet>

      <MobilePullToRefresh onRefresh={async () => {}}>
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-8 px-4">
          {/* Back Button */}
          <div className="flex items-center gap-4">
            <BackButton />
            <MobileOnly>
              <MobileShareSheet
                title={`Compartir ${affiliate.name}`}
                url={window.location.href}
                text={`¡Descubre ${affiliate.name}! ${affiliate.code ? `Código: ${affiliate.code}` : ""}`}
              />
            </MobileOnly>
          </div>
          {/* Hero */}
          <div className="text-center space-y-4 md:space-y-6 py-4 md:py-8">
            <Badge variant="secondary" className="text-xs md:text-sm">
              {affiliate.category}
            </Badge>
            
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground">
            {affiliate.name}
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            La mejor herramienta de {affiliate.category.toLowerCase()} para desarrolladores.
            Potencia tu productividad con {affiliate.name}.
          </p>

          {/* Commission/Discount highlight */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {affiliate.commission && (
              <Badge className="text-lg py-2 px-4 bg-green-500/10 text-green-400 border-green-500/20">
                <Sparkles className="h-4 w-4 mr-2" />
                Comisión: {affiliate.commission}
              </Badge>
            )}
            {affiliate.code && (
              <Badge className="text-lg py-2 px-4 bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                <Star className="h-4 w-4 mr-2" />
                Código: {affiliate.code}
              </Badge>
            )}
          </div>

          {/* CTA Button */}
          <Button
            size="lg"
            onClick={handleClick}
            className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700"
          >
            Obtener {affiliate.name} ahora
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Benefits */}
        <Card className="bg-card/50">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4 text-center">
              ¿Por qué elegir {affiliate.name}?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Secondary CTA */}
        <div className="text-center p-8 rounded-xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10">
          <h3 className="text-2xl font-bold mb-2">
            ¿Listo para empezar?
          </h3>
          <p className="text-muted-foreground mb-4">
            Únete a miles de desarrolladores que ya usan {affiliate.name}
          </p>
          <Button onClick={handleClick} size="lg" variant="outline">
            <ExternalLink className="mr-2 h-4 w-4" />
            Ir a {affiliate.name}
          </Button>
        </div>

        {/* Related tools */}
        <div className="pt-8 border-t border-border">
          <h3 className="text-lg font-semibold mb-4">
            Herramientas relacionadas
          </h3>
          <AffiliateRecommendations
            context="tool"
            category={affiliate.category}
            limit={3}
          />
        </div>
      </MobilePullToRefresh>
    </Layout>
  );
}

