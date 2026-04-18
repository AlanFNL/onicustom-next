"use client";

import { useRouter } from "next/navigation";
import ImageEditor from "../components/editor/ImageEditor";
import { productCards } from "../lib/product-cards";

export default function ProductEditorClient({
  productId,
}: {
  productId: string;
}) {
  const router = useRouter();

  return (
    <ImageEditor
      productId={productId}
      productCards={productCards}
      onBack={() => router.push("/")}
    />
  );
}
