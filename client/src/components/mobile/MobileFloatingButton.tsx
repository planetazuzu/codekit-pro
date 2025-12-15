/**
 * MobileFloatingButton Component
 * Botón flotante optimizado para móvil
 */

import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";
import { hapticPress } from "@/utils/haptic-feedback";

interface MobileFloatingButtonProps extends Omit<ButtonProps, "className"> {
  /** Icon component (pass component function, e.g. icon={Plus}) */
  icon?: React.ComponentType<{ className?: string }>;
  /** Icon as ReactNode (already rendered JSX, e.g. icon={<Plus />}) */
  iconNode?: ReactNode;
  label?: string;
  position?: "bottom-right" | "bottom-left" | "bottom-center";
  className?: string;
}

export function MobileFloatingButton({
  icon: Icon,
  iconNode,
  label,
  position = "bottom-right",
  className,
  children,
  ...props
}: MobileFloatingButtonProps) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  const positionClasses = {
    "bottom-right": "bottom-20 right-4",
    "bottom-left": "bottom-20 left-4",
    "bottom-center": "bottom-20 left-1/2 -translate-x-1/2",
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    hapticPress();
    props.onClick?.(e);
  };

  return (
    <Button
      {...props}
      onClick={handleClick}
      className={cn(
        "fixed h-14 w-14 rounded-full shadow-lg z-40",
        "flex items-center justify-center",
        "transition-transform active:scale-95",
        positionClasses[position],
        className
      )}
      size="icon"
    >
      {/* Render icon component correctly - this fixes React Error #31 */}
      {Icon && (
        <span className="h-6 w-6 flex items-center justify-center">
          <Icon className="h-6 w-6" />
        </span>
      )}
      {iconNode && <span className="h-6 w-6">{iconNode}</span>}
      {label && !Icon && !iconNode && <span className="text-sm font-medium">{label}</span>}
      {children}
    </Button>
  );
}

