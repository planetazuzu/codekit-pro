/**
 * Gamification Widget - Shows credits and achievements
 */

import { useState } from "react";
import {
  Coins,
  Trophy,
  Flame,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { useGamification } from "@/hooks/use-gamification";
import { cn } from "@/lib/utils";

interface GamificationWidgetProps {
  className?: string;
  compact?: boolean;
}

export function GamificationWidget({
  className,
  compact = false,
}: GamificationWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { credits, achievements, clickStreak, uniqueAffiliatesClicked } =
    useGamification();

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <Badge variant="outline" className="flex items-center gap-1">
          <Coins className="h-3 w-3 text-yellow-400" />
          <span>{credits.total}</span>
        </Badge>
        {clickStreak > 0 && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Flame className="h-3 w-3 text-orange-400" />
            <span>{clickStreak}</span>
          </Badge>
        )}
        <Badge variant="outline" className="flex items-center gap-1">
          <Trophy className="h-3 w-3 text-purple-400" />
          <span>
            {unlockedCount}/{achievements.length}
          </span>
        </Badge>
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-400" />
                Tus Logros
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-yellow-400" />
                  <span className="font-bold">{credits.total}</span>
                </div>
                {clickStreak > 0 && (
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4 text-orange-400" />
                    <span className="text-sm">{clickStreak} días</span>
                  </div>
                )}
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center pb-4 border-b border-border">
              <div>
                <p className="text-2xl font-bold text-yellow-400">
                  {credits.earned}
                </p>
                <p className="text-xs text-muted-foreground">Créditos ganados</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">
                  {uniqueAffiliatesClicked}
                </p>
                <p className="text-xs text-muted-foreground">
                  Herramientas visitadas
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-400">
                  {unlockedCount}
                </p>
                <p className="text-xs text-muted-foreground">Logros</p>
              </div>
            </div>

            {/* Achievements */}
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg",
                    achievement.unlocked
                      ? "bg-green-500/10 border border-green-500/20"
                      : "bg-muted/50"
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-full",
                      achievement.unlocked
                        ? "bg-green-500/20 text-green-400"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {achievement.unlocked ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          achievement.unlocked
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {achievement.name}
                      </p>
                      {!achievement.unlocked && (
                        <span className="text-xs text-muted-foreground">
                          {achievement.current}/{achievement.requirement}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {achievement.description}
                    </p>
                    {!achievement.unlocked && (
                      <Progress
                        value={achievement.progress}
                        className="h-1 mt-2"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* How to earn */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                💡 Gana créditos usando enlaces de afiliados. Desbloquea logros
                y canjea recompensas.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

/**
 * Mini widget for header/sidebar
 */
export function GamificationMini() {
  const { credits, clickStreak } = useGamification();

  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-muted/50">
      <div className="flex items-center gap-1">
        <Coins className="h-3 w-3 text-yellow-400" />
        <span className="text-xs font-medium">{credits.total}</span>
      </div>
      {clickStreak > 0 && (
        <>
          <span className="text-muted-foreground">|</span>
          <div className="flex items-center gap-1">
            <Flame className="h-3 w-3 text-orange-400" />
            <span className="text-xs">{clickStreak}</span>
          </div>
        </>
      )}
    </div>
  );
}

