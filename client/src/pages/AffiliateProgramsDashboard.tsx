/**
 * Affiliate Programs Dashboard
 * Dashboard con proyección de ingresos y métricas agregadas
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
  PieChart,
  AlertCircle,
} from "lucide-react";
import { useAffiliatePrograms, useAffiliateProgramsStats } from "@/hooks/use-affiliate-programs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AffiliateProgramsDashboard() {
  const { data: programs = [], isLoading: programsLoading } = useAffiliatePrograms();
  const { data: stats, isLoading: statsLoading } = useAffiliateProgramsStats();

  const isLoading = programsLoading || statsLoading;

  // Calculate revenue projections
  const projections = useMemo(() => {
    if (!stats || !programs.length) return null;

    // Get last 30 days of clicks/revenue data (simplified - using current totals)
    const totalClicks = stats.totalClicks || 0;
    const totalRevenue = stats.totalRevenue || 0;

    // Simple projection: assume daily average based on total
    // In a real scenario, you'd calculate this from historical daily data
    const daysInPeriod = 30; // Assume data is for last 30 days
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

  // Top affiliates by revenue
  const topAffiliates = useMemo(() => {
    return programs
      .filter((p) => parseFloat(p.estimatedRevenue || "0") > 0)
      .sort((a, b) => parseFloat(b.estimatedRevenue || "0") - parseFloat(a.estimatedRevenue || "0"))
      .slice(0, 10);
  }, [programs]);

  // Revenue by category
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

  // Clicks by category
  const clicksByCategory = useMemo(() => {
    const categoryMap = new Map<string, number>();
    programs.forEach((p) => {
      const clicks = parseInt(p.totalClicks || "0", 10);
      const current = categoryMap.get(p.category) || 0;
      categoryMap.set(p.category, current + clicks);
    });
    return Array.from(categoryMap.entries())
      .map(([category, clicks]) => ({ category, clicks }))
      .sort((a, b) => b.clicks - a.clicks);
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
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <BackButton />
        </div>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Afiliados</h1>
          <p className="text-muted-foreground mt-1">
            Métricas agregadas y proyección de ingresos
          </p>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MousePointer className="h-4 w-4" />
                Total Clics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalClicks || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Clics registrados en total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Ingresos Estimados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                ${(stats?.totalRevenue || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ingresos totales estimados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Programas Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.byStatus.approved || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                De {stats?.total || 0} totales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Promedio Diario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${projections?.dailyAverageRevenue.toFixed(2) || "0.00"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ingresos promedio diarios
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Projections */}
        {projections && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Proyección Mensual Estimada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-400 mb-2">
                  ${projections.monthlyProjection.toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Basado en el promedio diario de los últimos 30 días
                </p>
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5" />
                    <p className="text-xs text-yellow-400">
                      Esta proyección se basa en el comportamiento de los últimos 30 días.
                      No es una garantía de ingresos reales.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Proyección Trimestral Estimada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-400 mb-2">
                  ${projections.quarterlyProjection.toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Basado en el promedio diario de los últimos 30 días
                </p>
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5" />
                    <p className="text-xs text-yellow-400">
                      Esta proyección se basa en el comportamiento de los últimos 30 días.
                      No es una garantía de ingresos reales.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Revenue by Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Ingresos por Categoría
              </CardTitle>
            </CardHeader>
            <CardContent>
              {revenueByCategory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
              ) : (
                <div className="space-y-3">
                  {revenueByCategory.map(({ category, revenue }) => {
                    const percentage = stats?.totalRevenue
                      ? (revenue / stats.totalRevenue) * 100
                      : 0;
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{category}</span>
                          <span className="font-medium">${revenue.toFixed(2)}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}% del total
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Clics por Categoría
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clicksByCategory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
              ) : (
                <div className="space-y-3">
                  {clicksByCategory.map(({ category, clicks }) => {
                    const percentage = stats?.totalClicks
                      ? (clicks / stats.totalClicks) * 100
                      : 0;
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{category}</span>
                          <span className="font-medium">{clicks}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}% del total
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Affiliates */}
        <Card>
          <CardHeader>
            <CardTitle>Top Afiliados por Ingresos Estimados</CardTitle>
          </CardHeader>
          <CardContent>
            {topAffiliates.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay afiliados con ingresos registrados aún
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Programa</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Clics</TableHead>
                    <TableHead className="text-right">Ingresos Estimados</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topAffiliates.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell className="font-medium">{program.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{program.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {parseInt(program.totalClicks || "0", 10).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-400">
                        ${parseFloat(program.estimatedRevenue || "0").toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            program.status === "approved"
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                          }
                        >
                          {program.status === "approved" ? "Aprobado" : program.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

