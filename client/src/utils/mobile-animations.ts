/**
 * Mobile Animations Utilities
 * Animaciones específicas para móvil
 */

import { Variants } from "framer-motion";

/**
 * Slide up animation for mobile
 */
export const slideUpMobile: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  },
};

/**
 * Fade in animation for mobile
 */
export const fadeInMobile: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  },
};

/**
 * Scale animation for mobile buttons
 */
export const scaleMobile: Variants = {
  tap: { scale: 0.95 },
  hover: { scale: 1.05 },
};

/**
 * Bottom sheet slide animation
 */
export const bottomSheetAnimation: Variants = {
  hidden: { y: "100%" },
  visible: { 
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 200 }
  },
  exit: { 
    y: "100%",
    transition: { duration: 0.2 }
  },
};

