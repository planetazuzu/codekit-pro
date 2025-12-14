/**
 * Mobile-optimized Deals Page
 * Single column layout optimized for mobile
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
import { MobilePullToRefresh, MobileShareSheet } from "@/components/mobile";
import { useTrackPageView } from "@/hooks/use-track-view";

export default function MobileDeals() {
  useTrackPageView("page", "deals-mobile");
  const { data: affiliates, isLoading } = useAffiliates();
  const trackClick = useTrackAffiliateClick();

  const dealsWithCodes = useMemo(() => {
    return affiliates?.filter((a) => a.code) || [];
  }, [affiliates]);

  const topAffiliates = useMemo(() => {
    return affiliates?.slice(0, 6) || [];
  }, [affiliates]);

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
        <title>Ofertas y Descuentos | CodeKit Pro</title>
        <meta
          name="description"
          content="Los mejores descuentos y ofertas en herramientas de desarrollo."
        />
      </Helmet>

      <MobilePullToRefresh onRefresh={async () => {}}>
        <div className="space-y-4 pb-20">
          {/* Header */}
          <div className="flex items-center gap-3">
            <BackButton />
            <MobileShareSheet
              title="Compartir Ofertas"
              url={window.location.href}
              text="¡Mira estas increíbles ofertas para desarrolladores!"
            />
          </div>

          <div className="text-center space-y-3 py-4">
            <Badge variant="secondary" className="text-xs">
              <Tag className="h-3 w-3 mr-1" />
              Ofertas Activas
            </Badge>
            <h1 className="text-2xl font-bold">Deals & Descuentos</h1>
            <p className="text-sm text-muted-foreground px-4">
              Descuentos exclusivos en las mejores herramientas para desarrolladores.
            </p>
          </div>

          {/* Deal of the Day */}
          {dealOfTheDay && (
            <Card className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border-yellow-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-400 text-base">
                  <Sparkles className="h-4 w-4" />
                  Oferta del Día
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-yellow-500/10 flex-shrink-0">
                      <Gift className="h-8 w-8 text-yellow-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold line-clamp-1">
                        {dealOfTheDay.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {dealOfTheDay.category}
                      </p>
                    </div>
                  </div>
                  
                  {dealOfTheDay.code && (
                    <div className="px-4 py-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-center">
                      <code className="text-yellow-400 font-mono text-base">
                        {dealOfTheDay.code}
                      </code>
                    </div>
                  )}
                  <Button
                    size="lg"
                    onClick={() => handleClick(dealOfTheDay)}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    Obtener Oferta
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="text-center">
              <CardContent className="pt-4 pb-4">
                <Tag className="h-6 w-6 text-blue-400 mx-auto mb-1" />
                <p className="text-xl font-bold">{affiliates?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Ofertas Activas</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4 pb-4">
                <Percent className="h-6 w-6 text-green-400 mx-auto mb-1" />
                <p className="text-xl font-bold">{dealsWithCodes.length}</p>
                <p className="text-xs text-muted-foreground">Con Código</p>
              </CardContent>
            </Card>
          </div>

          {/* Deals with Discount Codes */}
          {dealsWithCodes.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-yellow-400" />
                Ofertas con Código
              </h2>
              <div className="space-y-3">
                {dealsWithCodes.map((affiliate) => (
                  <AffiliateCard key={affiliate.id} affiliate={affiliate} />
                ))}
              </div>
            </section>
          )}

          {/* Top Affiliates */}
          {topAffiliates.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-400" />
                Destacados
              </h2>
              <div className="space-y-3">
                {topAffiliates.map((affiliate) => (
                  <AffiliateCard key={affiliate.id} affiliate={affiliate} />
                ))}
              </div>
            </section>
          )}

          {/* All Deals */}
          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Gift className="h-4 w-4 text-blue-400" />
              Todas las Ofertas
            </h2>
            <div className="space-y-3">
              {affiliates?.map((affiliate) => (
                <AffiliateCard key={affiliate.id} affiliate={affiliate} />
              ))}
            </div>
          </section>

          {/* Footer */}
          <div className="text-center py-4 text-muted-foreground px-4">
            <p className="text-xs">
              💡 Todas las ofertas son verificadas y actualizadas regularmente.
            </p>
          </div>
        </div>
      </MobilePullToRefresh>
    </Layout>
  );
}
