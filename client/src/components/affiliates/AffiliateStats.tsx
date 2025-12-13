/**
 * Affiliate Stats Component
 */

import { useMemo } from "react";
import { TrendingUp, MousePointer, BarChart3, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAffiliateStats, useAffiliates } from "@/hooks/use-affiliates";
import { cn } from "@/lib/utils";

interface AffiliateStatsProps {
  affiliateId?: string;
  className?: string;
}

export function AffiliateStats({ affiliateId, className }: AffiliateStatsProps) {
  const { data: stats, isLoading: statsLoading } = useAffiliateStats(affiliateId);
  const { data: affiliates } = useAffiliates();

  const summary = useMemo(() => {
    if (!stats) return { totalClicks: 0, avgPerDay: 0, topDay: "-" };
    
    const { totalClicks, clicksByDay } = stats;
    const avgPerDay = clicksByDay.length > 0 
      ? Math.round(totalClicks / clicksByDay.length) 
      : 0;
    
    const topDayData = clicksByDay.reduce(
      (max, current) => (current.count > max.count ? current : max),
      { date: "-", count: 0 }
    );

    return {
      totalClicks,
      avgPerDay,
      topDay: topDayData.date !== "-" ? topDayData.date : "-",
      topDayCount: topDayData.count > 0 ? topDayData.count : undefined,
    };
  }, [stats]);

  const ctr = useMemo(() => {
    // Simulated CTR based on views (would need actual page view data)
    if (!stats?.totalClicks) return "0%";
    // For demo, assume 10x views per click as baseline
    return `${Math.min((stats.totalClicks / 10) * 100, 100).toFixed(1)}%`;
  }, [stats]);

  if (statsLoading) {
    return (
      <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-8 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {/* Total Clicks */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Clics Totales
          </CardTitle>
          <MousePointer className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {summary.totalClicks}
          </div>
        </CardContent>
      </Card>

      {/* Avg per day */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Promedio/Día
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {summary.avgPerDay}
          </div>
        </CardContent>
      </Card>

      {/* CTR */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            CTR Estimado
          </CardTitle>
          <Percent className="h-4 w-4 text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{ctr}</div>
        </CardContent>
      </Card>

      {/* Top day */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Mejor Día
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-foreground">
            {summary.topDay}
          </div>
          {summary.topDayCount && summary.topDayCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {summary.topDayCount} clics
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Clicks Chart - Simple bar visualization
 */
export function AffiliateClicksChart({ affiliateId }: { affiliateId?: string }) {
  const { data: stats, isLoading } = useAffiliateStats(affiliateId);

  if (isLoading) {
    return <div className="h-48 bg-muted animate-pulse rounded-lg" />;
  }

  if (!stats?.clicksByDay.length) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground">
        No hay datos de clics aún
      </div>
    );
  }

  const maxCount = Math.max(...stats.clicksByDay.map((d) => d.count));
  const last7Days = stats.clicksByDay.slice(-7);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Clics (últimos 7 días)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2 h-32">
          {last7Days.map((day) => {
            const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
            return (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <span className="text-xs text-muted-foreground">
                  {day.count}
                </span>
                <div
                  className="w-full bg-blue-500 rounded-t transition-all"
                  style={{ height: `${Math.max(height, 5)}%` }}
                />
                <span className="text-xs text-muted-foreground truncate max-w-full">
                  {new Date(day.date).toLocaleDateString("es", { weekday: "short" })}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

