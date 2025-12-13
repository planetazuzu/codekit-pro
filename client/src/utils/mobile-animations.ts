/**
 * Mobile Animations Utilities
 * Animaciones específicas para móvil optimizadas para rendimiento
 */

import { Variants } from "framer-motion";

/**
 * Slide up animation for mobile (optimizada)
 */
export const slideUpMobile: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      duration: 0.4, 
      ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuart
      staggerChildren: 0.05
    }
  },
};

/**
 * Fade in animation for mobile (optimizada)
 */
export const fadeInMobile: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  },
};

/**
 * Scale animation for mobile buttons (mejorada)
 */
export const scaleMobile: Variants = {
  tap: { scale: 0.92 },
  hover: { scale: 1.02 },
};

/**
 * Bottom sheet slide animation (mejorada)
 */
export const bottomSheetAnimation: Variants = {
  hidden: { y: "100%", opacity: 0 },
  visible: { 
    y: 0,
    opacity: 1,
    transition: { 
      type: "spring", 
      damping: 30, 
      stiffness: 300,
      mass: 0.8
    }
  },
  exit: { 
    y: "100%",
    opacity: 0,
    transition: { duration: 0.25, ease: "easeIn" }
  },
};

/**
 * Card stagger animation for lists
 */
export const cardStagger: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.08,
    },
  },
};

/**
 * Slide in from right (para navegación)
 */
export const slideInRight: Variants = {
  hidden: { x: "100%", opacity: 0 },
  visible: { 
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  exit: { 
    x: "100%",
    opacity: 0,
    transition: { duration: 0.2 }
  },
};

/**
 * Bounce animation for important actions
 */
export const bounceMobile: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1,
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 400,
      damping: 17
    }
  },
};

/**
 * Shake animation for errors
 */
export const shakeMobile: Variants = {
  hidden: { x: 0 },
  visible: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.5 }
  },
};

