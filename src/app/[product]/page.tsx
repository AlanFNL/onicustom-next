import { notFound, redirect } from "next/navigation";
import {
  getProductIdFromSlug,
  productCards,
  VALID_PRODUCT_SLUGS,
} from "../lib/product-cards";
import ProductEditorClient from "./ProductEditorClient";

type PageProps = {
  params: Promise<{ product: string }>;
};

export default async function ProductRoutePage({ params }: PageProps) {
  const { product: slug } = await params;

  if (!VALID_PRODUCT_SLUGS.includes(slug)) {
    notFound();
  }

  const productId = getProductIdFromSlug(slug);
  if (!productId) {
    notFound();
  }

  const card = productCards.find((p) => p.id === productId);
  if (card?.disabled) {
    redirect("/");
  }

  return <ProductEditorClient productId={productId} />;
}
