/**
 * Mobile-optimized AffiliateProgramsDashboard Page
 * Simplified version with essential metrics only
 */

import { useMemo } from "react";
import { Layout } from "@/layout/Layout";
import { BackButton } from "@/components/common/BackButton";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  MousePointer,
  DollarSign,
  Calendar,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import { useAffiliatePrograms, useAffiliateProgramsStats } from "@/hooks/use-affiliate-programs";
import { MobilePullToRefresh } from "@/components/mobile";

export default function MobileAffiliateProgramsDashboard() {
  const { data: programs = [], isLoading: programsLoading } = useAffiliatePrograms();
  const { data: stats, isLoading: statsLoading } = useAffiliateProgramsStats();

  const isLoading = programsLoading || statsLoading;

  const projections = useMemo(() => {
    if (!stats || !programs.length) return null;

    const totalClicks = stats.totalClicks || 0;
    const totalRevenue = stats.totalRevenue || 0;
    const daysInPeriod = 30;
    const dailyAverageClicks = totalClicks / daysInPeriod;
    const dailyAverageRevenue = totalRevenue / daysInPeriod;

    const monthlyProjection = dailyAverageRevenue * 30;
    const quarterlyProjection = dailyAverageRevenue * 90;

    return {
      dailyAverageClicks,
      dailyAverageRevenue,
      monthlyProjection,
      quarterlyProjection,
    };
  }, [stats, programs]);

  const topAffiliates = useMemo(() => {
    return programs
      .filter((p) => parseFloat(p.estimatedRevenue || "0") > 0)
      .sort((a, b) => parseFloat(b.estimatedRevenue || "0") - parseFloat(a.estimatedRevenue || "0"))
      .slice(0, 5);
  }, [programs]);

  const revenueByCategory = useMemo(() => {
    const categoryMap = new Map<string, number>();
    programs.forEach((p) => {
      const revenue = parseFloat(p.estimatedRevenue || "0");
      const current = categoryMap.get(p.category) || 0;
      categoryMap.set(p.category, current + revenue);
    });
    return Array.from(categoryMap.entries())
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [programs]);

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout>
      <MobilePullToRefresh onRefresh={async () => {}}>
        <div className="space-y-4 pb-20">
          {/* Header */}
          <div className="flex items-center gap-3">
            <BackButton />
          </div>

          <div>
            <h1 className="text-2xl font-bold">Dashboard de Afiliados</h1>
            <p className="text-sm text-muted-foreground">
              Métricas y proyección de ingresos
            </p>
          </div>

          {/* Main Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Total Clics</p>
                </div>
                <div className="text-xl font-bold">{stats?.totalClicks || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Ingresos</p>
                </div>
                <div className="text-xl font-bold text-green-400">
                  ${(stats?.totalRevenue || 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Activos</p>
                </div>
                <div className="text-xl font-bold">
                  {stats?.byStatus.approved || 0} / {stats?.total || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Promedio Diario</p>
                </div>
                <div className="text-xl font-bold">
                  ${projections?.dailyAverageRevenue.toFixed(2) || "0.00"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Projections */}
          {projections && (
            <div className="space-y-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Proyección Mensual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    ${projections.monthlyProjection.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Basado en promedio diario
                  </p>
                  <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        Esta es una estimación. Los ingresos reales pueden variar.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Proyección Trimestral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    ${projections.quarterlyProjection.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Basado en promedio diario
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Top Affiliates */}
          {topAffiliates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mejores Afiliados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topAffiliates.map((affiliate, index) => (
                    <div
                      key={affiliate.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xs text-muted-foreground w-4">
                          #{index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">
                            {affiliate.name}
                          </p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {affiliate.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-400">
                          ${parseFloat(affiliate.estimatedRevenue || "0").toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {affiliate.totalClicks || 0} clics
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Revenue by Category */}
          {revenueByCategory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ingresos por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {revenueByCategory.map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{item.category}</span>
                      <span className="text-sm font-bold text-green-400">
                        ${item.revenue.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </MobilePullToRefresh>
    </Layout>
  );
}
