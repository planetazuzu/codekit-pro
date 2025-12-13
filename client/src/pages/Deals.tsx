/**
 * Deals & Discounts Page
 * Shows all active offers and discount codes
 */

import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import {
  Tag,
  Percent,
  Sparkles,
  TrendingUp,
  Calendar,
  Gift,
} from "lucide-react";
import { Layout } from "@/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AffiliateCard } from "@/components/affiliates/AffiliateCard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { BackButton } from "@/components/common/BackButton";
import { useAffiliates, useTrackAffiliateClick } from "@/hooks/use-affiliates";
import { buildAffiliateUrl } from "@/lib/affiliate-utils";
import type { Affiliate } from "@shared/schema";

export default function Deals() {
  const { data: affiliates, isLoading } = useAffiliates();
  const trackClick = useTrackAffiliateClick();

  // Get affiliates with discount codes
  const dealsWithCodes = useMemo(() => {
    return affiliates?.filter((a) => a.code) || [];
  }, [affiliates]);

  // Get top affiliates (removed commission-based sorting)
  const topAffiliates = useMemo(() => {
    return affiliates?.slice(0, 6) || [];
  }, [affiliates]);

  // Simulated "deal of the day" - rotates based on date
  const dealOfTheDay = useMemo(() => {
    if (!affiliates?.length) return null;
    const dayIndex = new Date().getDate() % affiliates.length;
    return affiliates[dayIndex];
  }, [affiliates]);

  const handleClick = async (affiliate: Affiliate) => {
    try {
      await trackClick.mutateAsync(affiliate.id);
      const finalUrl = buildAffiliateUrl(affiliate, "codekit", "deals", "featured");
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

  return (
    <Layout>
      <Helmet>
        <title>Ofertas y Descuentos para Desarrolladores | CodeKit Pro</title>
        <meta
          name="description"
          content="Los mejores descuentos y ofertas en herramientas de desarrollo. Códigos promocionales exclusivos para hosting, IA, UI kits y más."
        />
        <meta
          name="keywords"
          content="descuentos desarrollo, ofertas programadores, código promocional hosting, cupón vercel, descuento github copilot"
        />
      </Helmet>

      <MobilePullToRefresh onRefresh={async () => {}}>
        <div className="space-y-4 md:space-y-8">
          {/* Back Button */}
          <div className="flex items-center gap-4">
            <BackButton />
            <MobileOnly>
              <MobileShareSheet
                title="Compartir Ofertas"
                url={window.location.href}
                text="¡Mira estas increíbles ofertas para desarrolladores!"
              />
            </MobileOnly>
          </div>

          {/* Header */}
          <div className="text-center space-y-3 md:space-y-4 py-4 md:py-8">
            <Badge variant="secondary" className="text-xs md:text-sm">
              <Tag className="h-3 w-3 mr-1" />
              Ofertas Activas
            </Badge>
            <h1 className="text-2xl md:text-4xl font-bold text-foreground">
              Deals & Descuentos
            </h1>
            <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Descuentos exclusivos en las mejores herramientas para desarrolladores.
              Códigos promocionales actualizados.
            </p>
          </div>

          {/* Deal of the Day */}
          {dealOfTheDay && (
          <Card className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border-yellow-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-400">
                <Sparkles className="h-5 w-5" />
                Oferta del Día
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-xl bg-yellow-500/10">
                    <Gift className="h-10 w-10 text-yellow-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {dealOfTheDay.name}
                    </h2>
                    <p className="text-muted-foreground">
                      {dealOfTheDay.category}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  {dealOfTheDay.code && (
                    <div className="px-4 py-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                      <code className="text-yellow-400 font-mono text-lg">
                        {dealOfTheDay.code}
                      </code>
                    </div>
                  )}
                  <Button
                    size="lg"
                    onClick={() => handleClick(dealOfTheDay)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    Obtener Oferta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Tag className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">{affiliates?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Ofertas Activas</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Percent className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">{dealsWithCodes.length}</p>
              <p className="text-sm text-muted-foreground">Con Código</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">{topAffiliates.length}</p>
              <p className="text-sm text-muted-foreground">Destacados</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Calendar className="h-8 w-8 text-orange-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-sm text-muted-foreground">Actualizados</p>
            </CardContent>
          </Card>
          </div>

          {/* Deals with Discount Codes */}
          {dealsWithCodes.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5 text-yellow-400" />
              Ofertas con Código de Descuento
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dealsWithCodes.map((affiliate) => (
                <AffiliateCard key={affiliate.id} affiliate={affiliate} />
              ))}
            </div>
          </section>
          )}

          {/* Top Affiliates */}
          {topAffiliates.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              Destacados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topAffiliates.map((affiliate) => (
                <AffiliateCard key={affiliate.id} affiliate={affiliate} />
              ))}
            </div>
          </section>
          )}

          {/* All Deals */}
          <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Gift className="h-5 w-5 text-blue-400" />
            Todas las Ofertas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {affiliates?.map((affiliate) => (
              <AffiliateCard key={affiliate.id} affiliate={affiliate} />
            ))}
          </div>
          </section>

          {/* SEO Footer */}
          <div className="text-center py-4 md:py-8 text-muted-foreground px-4">
          <p className="text-xs md:text-sm">
            💡 Todas las ofertas son verificadas y actualizadas regularmente.
            Los códigos de descuento pueden expirar sin previo aviso.
          </p>
          </div>
        </div>
      </MobilePullToRefresh>
    </Layout>
  );
}

