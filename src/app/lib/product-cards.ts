export interface ProductCard {
  id: string;
  title: string;
  image: string;
  description: string;
  redirectUrl?: string;
  disabled: boolean;
}

/** URL segment for each product (e.g. /keycap, /spacebar, /mousepad-90x40) */
export const PRODUCT_ID_TO_SLUG: Record<string, string> = {
  "mousepad-90x40": "mousepad-90x40",
  "mousepad-60x40": "mousepad-60x40",
  "keycap-kda": "keycap",
  spacebar: "spacebar",
};

export function getSlugForProductId(productId: string): string {
  return PRODUCT_ID_TO_SLUG[productId] ?? productId;
}

export function getProductIdFromSlug(slug: string): string | null {
  const entry = Object.entries(PRODUCT_ID_TO_SLUG).find(
    ([, s]) => s === slug,
  );
  return entry ? entry[0] : null;
}

export const VALID_PRODUCT_SLUGS = Object.values(PRODUCT_ID_TO_SLUG);

export const productCards: ProductCard[] = [
  {
    id: "mousepad-90x40",
    title: "Deskpad 90x40 $35.000",
    image: "/assets/mousepad9040.webp",
    description: "Mousepad premium de gran tamaño",
    redirectUrl:
      "https://www.onicaps.online/productos/desk-pad-personalizado/",
    disabled: false,
  },
  {
    id: "mousepad-60x40",
    title: "Deskpad 60x40 $33.500",
    image: "/assets/mousepad6040.webp",
    description: "Mousepad compacto perfecto para tu setup",
    redirectUrl:
      "https://www.onicaps.online/productos/desk-pad-personalizado/",
    disabled: true,
  },
  {
    id: "keycap-kda",
    title: "Keycap XDA $ 6.500",
    image: "/assets/keycap.webp",
    description: "Keycaps personalizados de alta calidad",
    redirectUrl:
      "https://www.onicaps.online/productos/keycap-pro-personalizada/",
    disabled: false,
  },
  {
    id: "spacebar",
    title: "Spacebar Custom $15.000",
    image: "/assets/spacebar.webp",
    description: "Barra espaciadora única para tu teclado",
    redirectUrl:
      "https://www.onicaps.online/productos/spacebar-personalizada-ov61k/",
    disabled: false,
  },
];
