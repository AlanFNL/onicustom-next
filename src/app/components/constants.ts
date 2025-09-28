// Product dimensions mapping (in pixels for final export/print)
export const PRODUCT_DIMENSIONS = {
  "mousepad-90x40": { width: 900, height: 400 },
  "mousepad-60x40": { width: 600, height: 400 },
  "keycap-kda": { width: 400, height: 400 },
  // Spacebar: 112.5mm x 15mm @ 300 DPI ≈ 1329 x 177 px
  spacebar: { width: 1329, height: 177 },
} as const;

export type ProductId = keyof typeof PRODUCT_DIMENSIONS;

// Canvas constants
export const BLEED_MARGIN_RATIO = 0.02;
export const BLEED_STROKE_WIDTH = 2;
export const MIN_IMAGE_SIZE = 50;
export const MOBILE_CONTROLS_TIMEOUT = 5000;

// Centering guide constants
export const CENTERING_GUIDE_STROKE_WIDTH = 2;
export const CENTERING_GUIDE_COLOR = "#3B82F6"; // Blue-500
export const CENTERING_GUIDE_OPACITY = 0.9;
export const CENTERING_GUIDE_FADE_DURATION = 300; // ms

// Animation constants
export const ANIMATION_DURATION = {
  MICRO: 100,
  STANDARD: 200,
  OVERLAY: 300,
};

export const ANIMATION_EASING = [0.32, 0.72, 0, 1] as const;
