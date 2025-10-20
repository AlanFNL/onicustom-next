// Product dimensions mapping (in pixels for final export/print)
export const PRODUCT_DIMENSIONS = {
  "mousepad-90x40": { width: 900, height: 400 },
  "mousepad-60x40": { width: 600, height: 400 },
  "keycap-kda": { width: 400, height: 400 },
  // Spacebar: 112.5mm x 15mm @ 300 DPI ≈ 1329 x 177 px
  spacebar: { width: 1329, height: 177 },
} as const;

export const PRODUCT_DISCLAIMERS = {
  "mousepad-90x40":
    "Subir una imagen de baja calidad resultará en una impresión de baja calidad. Imprimimos lo que nos enviás. Pasamos a producción todos los lunes y despachamos todos los viernes. Significa que si compras un MARTES, pasa a producción el LUNES siguiente y se despacha el VIERNES. Luego de subir y confirmar la imagen, el editor te redireccionará a la web para completar tu compra.",
  "mousepad-60x40":
    "Subir una imagen de baja calidad resultará en una impresión de baja calidad. Imprimimos lo que nos enviás. Pasamos a producción todos los lunes y despachamos todos los viernes. Significa que si compras un MARTES, pasa a producción el LUNES siguiente y se despacha el VIERNES. Luego de subir y confirmar la imagen, el editor te redireccionará a la web para completar tu compra.",
  "keycap-kda":
    "Subir una imagen de baja calidad resultará en una impresión de baja calidad. Imprimimos lo que nos enviás. Perfil XDA. Material PBT. No son stickers ni sublimación es impresion directa sobre la keycap de pbt. No se puede personalizar sobre los costados de la keycap. ATENCION:  Tener en cuenta que los diseños sobre keycaps negras suelen quedar algo apagados si la imagen no es de una calidad muy alta.",
  spacebar:
    "Subir una imagen de baja calidad resultará en una impresión de baja calidad. Imprimimos lo que nos enviás. Pasamos a producción todos los lunes y despachamos todos los viernes. Significa que si compras un MARTES, pasa a producción el LUNES siguiente y se despacha el VIERNES. Luego de subir y confirmar la imagen, el editor te redireccionará a la web para completar tu compra.",
} as const;

export type ProductId = keyof typeof PRODUCT_DIMENSIONS;

export const BLEED_MARGIN_RATIO = 0.02;
export const BLEED_STROKE_WIDTH = 2;
export const MIN_IMAGE_SIZE = 50;
export const MOBILE_CONTROLS_TIMEOUT = 5000;

export const CENTERING_GUIDE_STROKE_WIDTH = 2;
export const CENTERING_GUIDE_COLOR = "#3B82F6";
export const CENTERING_GUIDE_OPACITY = 0.9;
export const CENTERING_GUIDE_FADE_DURATION = 300;

export const ANIMATION_DURATION = {
  MICRO: 100,
  STANDARD: 200,
  OVERLAY: 300,
};

export const ANIMATION_EASING = [0.32, 0.72, 0, 1] as const;
