/**
 * Haptic Feedback Utilities
 * Feedback háptico (vibración) para móvil
 */

/**
 * Trigger haptic feedback if supported
 */
export function triggerHaptic(type: "light" | "medium" | "heavy" | "success" | "warning" | "error" = "medium") {
  if (typeof navigator === "undefined" || !navigator.vibrate) {
    return;
  }

  const patterns: Record<string, number | number[]> = {
    light: 10,
    medium: 20,
    heavy: 30,
    success: [10, 50, 10],
    warning: [20, 50, 20],
    error: [30, 100, 30],
  };

  const pattern = patterns[type] || patterns.medium;
  navigator.vibrate(pattern);
}

/**
 * Haptic feedback for button press
 */
export function hapticPress() {
  triggerHaptic("light");
}

/**
 * Haptic feedback for success action
 */
export function hapticSuccess() {
  triggerHaptic("success");
}

/**
 * Haptic feedback for error
 */
export function hapticError() {
  triggerHaptic("error");
}

/**
 * Haptic feedback for warning
 */
export function hapticWarning() {
  triggerHaptic("warning");
}

