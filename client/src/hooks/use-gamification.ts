/**
 * Gamification hooks for affiliate credits and achievements
 */

import { useState, useCallback, useMemo } from "react";
import { useLocalStorage } from "./utils/use-local-storage";

export interface UserCredits {
  total: number;
  earned: number;
  spent: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  requirement: number;
  type: "clicks" | "affiliates" | "tools" | "streak";
}

export interface GamificationState {
  credits: UserCredits;
  achievements: Achievement[];
  clickStreak: number;
  lastClickDate: string | null;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-click",
    name: "Primer Clic",
    description: "Usaste tu primer enlace de afiliado",
    icon: "MousePointer",
    unlocked: false,
    requirement: 1,
    type: "clicks",
  },
  {
    id: "explorer",
    name: "Explorador",
    description: "Visitaste 5 herramientas diferentes",
    icon: "Compass",
    unlocked: false,
    requirement: 5,
    type: "affiliates",
  },
  {
    id: "power-user",
    name: "Power User",
    description: "Usaste 10 enlaces de afiliados",
    icon: "Zap",
    unlocked: false,
    requirement: 10,
    type: "clicks",
  },
  {
    id: "tool-master",
    name: "Maestro de Herramientas",
    description: "Exploraste 10 herramientas diferentes",
    icon: "Wrench",
    unlocked: false,
    requirement: 10,
    type: "affiliates",
  },
  {
    id: "streak-3",
    name: "Racha de 3",
    description: "Usaste afiliados 3 días seguidos",
    icon: "Flame",
    unlocked: false,
    requirement: 3,
    type: "streak",
  },
  {
    id: "streak-7",
    name: "Racha Semanal",
    description: "Usaste afiliados 7 días seguidos",
    icon: "Fire",
    unlocked: false,
    requirement: 7,
    type: "streak",
  },
  {
    id: "collector-25",
    name: "Coleccionista",
    description: "Acumulaste 25 créditos",
    icon: "Coins",
    unlocked: false,
    requirement: 25,
    type: "clicks",
  },
  {
    id: "veteran-50",
    name: "Veterano",
    description: "Usaste 50 enlaces de afiliados",
    icon: "Award",
    unlocked: false,
    requirement: 50,
    type: "clicks",
  },
];

const DEFAULT_STATE: GamificationState = {
  credits: { total: 0, earned: 0, spent: 0 },
  achievements: DEFAULT_ACHIEVEMENTS,
  clickStreak: 0,
  lastClickDate: null,
};

export function useGamification() {
  const [state, setState] = useLocalStorage<GamificationState>(
    "codekit-gamification",
    DEFAULT_STATE
  );

  // Track unique affiliates clicked
  const [clickedAffiliates, setClickedAffiliates] = useLocalStorage<string[]>(
    "codekit-clicked-affiliates",
    []
  );

  // Add credits for a click
  const addClickCredit = useCallback(
    (affiliateId: string) => {
      const today = new Date().toISOString().split("T")[0];
      
      setState((prev) => {
        const newCredits = {
          total: prev.credits.total + 1,
          earned: prev.credits.earned + 1,
          spent: prev.credits.spent,
        };

        // Update streak
        let newStreak = prev.clickStreak;
        if (prev.lastClickDate) {
          const lastDate = new Date(prev.lastClickDate);
          const todayDate = new Date(today);
          const diffDays = Math.floor(
            (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diffDays === 1) {
            newStreak = prev.clickStreak + 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }

        // Check achievements
        const newAchievements = prev.achievements.map((achievement) => {
          if (achievement.unlocked) return achievement;

          let shouldUnlock = false;

          switch (achievement.type) {
            case "clicks":
              shouldUnlock = newCredits.earned >= achievement.requirement;
              break;
            case "streak":
              shouldUnlock = newStreak >= achievement.requirement;
              break;
            case "affiliates":
              // Will be checked separately
              break;
          }

          if (shouldUnlock) {
            return {
              ...achievement,
              unlocked: true,
              unlockedAt: new Date().toISOString(),
            };
          }

          return achievement;
        });

        return {
          ...prev,
          credits: newCredits,
          achievements: newAchievements,
          clickStreak: newStreak,
          lastClickDate: today,
        };
      });

      // Track unique affiliates
      setClickedAffiliates((prev) => {
        if (!prev.includes(affiliateId)) {
          const newClicked = [...prev, affiliateId];
          
          // Check affiliate achievements
          setState((prevState) => ({
            ...prevState,
            achievements: prevState.achievements.map((achievement) => {
              if (achievement.unlocked || achievement.type !== "affiliates") {
                return achievement;
              }
              
              if (newClicked.length >= achievement.requirement) {
                return {
                  ...achievement,
                  unlocked: true,
                  unlockedAt: new Date().toISOString(),
                };
              }
              
              return achievement;
            }),
          }));
          
          return newClicked;
        }
        return prev;
      });
    },
    [setState, setClickedAffiliates]
  );

  // Spend credits
  const spendCredits = useCallback(
    (amount: number): boolean => {
      if (state.credits.total < amount) return false;

      setState((prev) => ({
        ...prev,
        credits: {
          total: prev.credits.total - amount,
          earned: prev.credits.earned,
          spent: prev.credits.spent + amount,
        },
      }));

      return true;
    },
    [state.credits.total, setState]
  );

  // Get newly unlocked achievements
  const newAchievements = useMemo(() => {
    return state.achievements.filter(
      (a) =>
        a.unlocked &&
        a.unlockedAt &&
        new Date(a.unlockedAt).getTime() > Date.now() - 60000 // Last minute
    );
  }, [state.achievements]);

  // Progress for each achievement
  const achievementProgress = useMemo(() => {
    return state.achievements.map((achievement) => {
      let current = 0;

      switch (achievement.type) {
        case "clicks":
          current = state.credits.earned;
          break;
        case "affiliates":
          current = clickedAffiliates.length;
          break;
        case "streak":
          current = state.clickStreak;
          break;
      }

      return {
        ...achievement,
        current,
        progress: Math.min((current / achievement.requirement) * 100, 100),
      };
    });
  }, [state, clickedAffiliates]);

  return {
    credits: state.credits,
    achievements: achievementProgress,
    clickStreak: state.clickStreak,
    newAchievements,
    addClickCredit,
    spendCredits,
    uniqueAffiliatesClicked: clickedAffiliates.length,
  };
}

