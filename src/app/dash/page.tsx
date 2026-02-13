"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

interface Design {
  id: string;
  email: string;
  img_url: string;
  code: string;
  timestamp: string;
  created_at: string;
}

interface ProductTitle {
  id: string;
  product_title: string;
  timestamp: string;
  created_at: string;
}

type ArtesanalStatus = "pendiente" | "contactado" | "completado";

interface ArtesanalOrder {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  character: string;
  note: string | null;
  image_url: string;
  status?: ArtesanalStatus;
  created_at: string;
}

const PASSWORD = "midisclosed2025";
const STORAGE_KEY = "dash_auth";
const IMAGE_CACHE_KEY = "dash-image-cache";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// Helper function to preserve original image format and size
const getOriginalImageUrl = (url: string): string => {
  if (!url) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}tr=orig-true`;
};

const ARTESANAL_MESSAGE_KEY = "artesanal_message_template";

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function DesignCard({
  design,
  showImage,
  getImageUrl,
}: {
  design: Design;
  showImage: boolean;
  getImageUrl: (design: Design) => string;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100"
      data-design-id={design.id}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {showImage && (
          <img
            src={getImageUrl(design)}
            alt={design.code}
            className="w-12 h-12 md:w-14 md:h-14 object-cover rounded-lg flex-shrink-0"
          />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {design.email}
          </p>
          <p className="text-xs text-gray-500">
            {formatDate(design.created_at || design.timestamp)}
          </p>
        </div>
      </div>
      <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-[#7a4dff]/15 text-[#7a4dff] flex-shrink-0">
        {design.code}
      </span>
    </div>
  );
}

function ProductTitleCard({ product }: { product: ProductTitle }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 truncate">
          {product.product_title}
        </p>
        <p className="text-xs text-gray-500">
          {formatDate(product.created_at || product.timestamp)}
        </p>
      </div>
      <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-700 flex-shrink-0">
        Descargado
      </span>
    </div>
  );
}

function digitsOnly(s: string) {
  return s.replace(/\D/g, "");
}

function buildPersonalizedMessage(
  template: string,
  order: ArtesanalOrder,
): string {
  return template
    .replace(/\{\{name\}\}/gi, order.full_name)
    .replace(/\{\{email\}\}/gi, order.email)
    .replace(/\{\{number\}\}/gi, order.phone || "");
}

const STATUS_STYLES: Record<
  ArtesanalStatus,
  { bg: string; text: string; label: string }
> = {
  pendiente: {
    bg: "bg-red-100",
    text: "text-red-700",
    label: "Pendiente",
  },
  contactado: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    label: "Contactado",
  },
  completado: {
    bg: "bg-green-100",
    text: "text-green-700",
    label: "Completado",
  },
};

function ArtesanalOrderCard({
  order,
  showImage,
  getImageUrl,
  onStatusChange,
  messageTemplate,
}: {
  order: ArtesanalOrder;
  showImage: boolean;
  getImageUrl: (url: string) => string;
  onStatusChange: (id: string, status: ArtesanalStatus) => void;
  messageTemplate: string;
}) {
  const status = (order.status ?? "pendiente") as ArtesanalStatus;
  const statusStyle = STATUS_STYLES[status];
  const hasPhone = !!order.phone?.trim();
  const phoneDigits = hasPhone
    ? digitsOnly(order.phone!).replace(/^0+/, "")
    : "";

  const handleSend = () => {
    const message = buildPersonalizedMessage(messageTemplate, order);
    if (hasPhone && phoneDigits.length >= 8) {
      const url = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    } else {
      const subject = encodeURIComponent(
        `Pedido keycap artesanal - ${order.character}`,
      );
      const body = encodeURIComponent(message);
      window.open(
        `mailto:${order.email}?subject=${subject}&body=${body}`,
        "_blank",
      );
    }
  };

  return (
    <div
      className="flex gap-5 p-5 bg-white rounded-xl shadow-sm border border-gray-100"
      data-artesanal-id={order.id}
    >
      {/* Image */}
      {showImage && order.image_url && (
        <img
          src={getImageUrl(order.image_url)}
          alt={order.character}
          className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl flex-shrink-0"
        />
      )}

      {/* Main info block */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-semibold text-gray-900">{order.full_name}</span>
          <span className="text-xs text-gray-500">
            {formatDate(order.created_at)}
          </span>
        </div>
        <p className="text-sm text-gray-600 truncate">{order.email}</p>
        {order.phone && (
          <p className="text-sm font-medium text-gray-800">
            Número: <span className="font-normal">{order.phone}</span>
          </p>
        )}
        <div className="mt-1">
          <p className="text-sm font-medium text-gray-800">
            Personaje: <span className="font-normal">{order.character}</span>
          </p>
          {order.note && (
            <p className="text-sm font-medium text-gray-800">
              Notas:{" "}
              <span className="font-normal break-words">{order.note}</span>
            </p>
          )}
        </div>
      </div>

      {/* Status + action */}
      <div className="flex flex-col items-end justify-between gap-3 flex-shrink-0">
        <select
          value={status}
          onChange={(e) =>
            onStatusChange(order.id, e.target.value as ArtesanalStatus)
          }
          className={`text-sm font-medium px-3 py-2 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#7a4dff] focus:ring-offset-1 ${statusStyle.bg} ${statusStyle.text}`}
        >
          <option value="pendiente">Pendiente</option>
          <option value="contactado">Contactado</option>
          <option value="completado">Completado</option>
        </select>
        <button
          type="button"
          onClick={handleSend}
          className="px-3 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
          title={hasPhone ? "Abrir WhatsApp" : "Abrir email"}
        >
          {hasPhone ? "WhatsApp" : "Email"}
        </button>
      </div>
    </div>
  );
}

function LoadingSkeletons() {
  return (
    <div className="space-y-8">
      {[1, 2].map((section) => (
        <div key={section}>
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 bg-gray-200 rounded-xl w-40 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded-xl w-24 animate-pulse" />
          </div>
          <div className="grid gap-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-white rounded-xl border border-gray-200 p-6 animate-shimmer"
              >
                <div className="flex items-start gap-6">
                  <div className="w-32 h-32 bg-gray-100 rounded-xl animate-shimmer" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-100 rounded w-3/4 animate-shimmer" />
                    <div className="h-4 bg-gray-100 rounded w-1/2 animate-shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <svg
        className="w-16 h-16 mb-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 13h6m-3-3v6m5 5H4a2 0 01-2-2V6a2 0 012-2h16a2 0 012 2v8a2 0 01-2 2z"
        />
      </svg>
      <p>{message}</p>
    </div>
  );
}

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [designs, setDesigns] = useState<Design[]>([]);
  const [productTitles, setProductTitles] = useState<ProductTitle[]>([]);
  const [artesanalOrders, setArtesanalOrders] = useState<ArtesanalOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImages, setShowImages] = useState(true);
  const [downloadFilter, setDownloadFilter] = useState<
    "all" | "keycap" | "spacebar"
  >("all");
  const [artesanalFilter, setArtesanalFilter] = useState<
    "all" | "pendiente" | "contactado" | "completado"
  >("all");
  const [activeTab, setActiveTab] = useState<
    "all" | "designs" | "downloads" | "artesanal"
  >("all");
  const [messageTemplate, setMessageTemplate] = useState("");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateDraft, setTemplateDraft] = useState("");

  const imageCacheRef = useRef<
    Record<string, { url: string; timestamp: number }>
  >({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Restore cached URLs on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(IMAGE_CACHE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Record<
        string,
        { url: string; timestamp: number }
      >;
      imageCacheRef.current = parsed;
    } catch (error) {
      console.warn("Failed to parse image cache", error);
    }
  }, []);

  const cacheImageUrl = useCallback((design: Design) => {
    if (!design?.id || !design?.img_url) return;
    const now = Date.now();
    imageCacheRef.current[design.id] = {
      url: getOriginalImageUrl(design.img_url),
      timestamp: now,
    };
    localStorage.setItem(
      IMAGE_CACHE_KEY,
      JSON.stringify(imageCacheRef.current),
    );
  }, []);

  const getDisplayImageUrl = useCallback((design: Design) => {
    const cached = imageCacheRef.current[design.id];
    const now = Date.now();
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return cached.url;
    }
    const freshUrl = getOriginalImageUrl(design.img_url);
    imageCacheRef.current[design.id] = { url: freshUrl, timestamp: now };
    localStorage.setItem(
      IMAGE_CACHE_KEY,
      JSON.stringify(imageCacheRef.current),
    );
    return freshUrl;
  }, []);

  // Observe cards to cache when first visible
  useEffect(() => {
    if (!showImages) return;
    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const designId = target.dataset.designId;
            if (!designId) return;
            const design = designs.find((d) => d.id === designId);
            if (design) {
              cacheImageUrl(design);
              observerRef.current?.unobserve(target);
            }
          }
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.1 },
    );

    const elements = document.querySelectorAll<HTMLElement>("[data-design-id]");
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, [designs, showImages, cacheImageUrl]);

  // Check localStorage on mount
  useEffect(() => {
    const auth = localStorage.getItem(STORAGE_KEY);
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Load message template from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(ARTESANAL_MESSAGE_KEY);
    const defaultTemplate =
      "Hola {{name}}, gracias por tu pedido de keycap artesanal. Te contactamos pronto.";
    setMessageTemplate(stored || defaultTemplate);
  }, []);

  const saveMessageTemplate = useCallback(() => {
    const value = templateDraft.trim() || messageTemplate;
    setMessageTemplate(value);
    localStorage.setItem(ARTESANAL_MESSAGE_KEY, value);
    setShowTemplateModal(false);
    setTemplateDraft(value);
  }, [templateDraft, messageTemplate]);

  const openTemplateModal = useCallback(() => {
    setTemplateDraft(messageTemplate);
    setShowTemplateModal(true);
  }, [messageTemplate]);

  const handleArtesanalStatusChange = useCallback(
    async (id: string, status: ArtesanalStatus) => {
      try {
        const res = await fetch(`/api/artesanal-order/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (res.ok) {
          setArtesanalOrders((prev) =>
            prev.map((o) => (o.id === id ? { ...o, status } : o)),
          );
        }
      } catch (err) {
        console.error("Error updating status:", err);
      }
    },
    [],
  );

  // Fetch data
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/dashboard-data");

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();

        if (data.success) {
          setDesigns(data.designs || []);
          setProductTitles(data.productTitles || []);
          setArtesanalOrders(data.artesanalOrders || []);
        } else {
          throw new Error(data.message || "Failed to fetch data");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscriptions
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase configuration missing");
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Subscribe to new designs
    const designsSubscription = supabase
      .channel("designs-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "designs" },
        (payload) => {
          const newDesign = payload.new as Design;
          setDesigns((prev) => [newDesign, ...prev]);
        },
      )
      .subscribe();

    // Subscribe to new product titles
    const productTitlesSubscription = supabase
      .channel("product_titles-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "product_titles" },
        (payload) => {
          const newProductTitle = payload.new as ProductTitle;
          setProductTitles((prev) => [newProductTitle, ...prev]);
        },
      )
      .subscribe();

    // Subscribe to artesanal orders (insert + update for status)
    const artesanalSubscription = supabase
      .channel("artesanal_orders-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "artesanal_orders" },
        (payload) => {
          const newOrder = payload.new as ArtesanalOrder;
          setArtesanalOrders((prev) => [newOrder, ...prev]);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "artesanal_orders" },
        (payload) => {
          const updated = payload.new as ArtesanalOrder;
          setArtesanalOrders((prev) =>
            prev.map((o) => (o.id === updated.id ? updated : o)),
          );
        },
      )
      .subscribe();

    return () => {
      designsSubscription.unsubscribe();
      productTitlesSubscription.unsubscribe();
      artesanalSubscription.unsubscribe();
    };
  }, [isAuthenticated]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEY, "true");
      setError("");
    } else {
      setError("Contraseña incorrecta");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
    setPassword("");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Acceso al Dashboard
            </h1>
            <p className="text-sm text-gray-600">
              Ingresá la contraseña para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7a4dff] transition-all"
                placeholder="Ingresá la contraseña"
                autoFocus
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#7a4dff] hover:bg-[#6b42e6] text-white font-medium py-3 rounded-xl transition-colors duration-200"
            >
              Acceder
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredProducts = productTitles.filter((product) => {
    if (downloadFilter === "all") return true;
    if (downloadFilter === "keycap")
      return product.product_title.toLowerCase().includes("keycap");
    if (downloadFilter === "spacebar")
      return product.product_title.toLowerCase().includes("spacebar");
    return true;
  });

  const filteredArtesanalOrders = artesanalOrders.filter((order) => {
    if (artesanalFilter === "all") return true;
    return (order.status ?? "pendiente") === artesanalFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/assets/logo.jpeg"
                alt="Onicaps Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {(
              [
                { id: "all" as const, label: "Todos" },
                { id: "designs" as const, label: "Diseños" },
                { id: "downloads" as const, label: "Descargas" },
                { id: "artesanal" as const, label: "Pedidos artesanales" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-[#7a4dff] text-[#7a4dff]"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <LoadingSkeletons />
        ) : (
          <div>
            {/* All Tab */}
            {activeTab === "all" && (
              <div className="space-y-8">
                {/* Designs Section */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Diseños ({designs.length})
                    </h2>
                    <button
                      onClick={() => setShowImages(!showImages)}
                      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                      {showImages ? "Ocultar imágenes" : "Mostrar imágenes"}
                    </button>
                  </div>
                  <div className="h-80 overflow-y-auto rounded-xl border border-gray-200 p-4 bg-white">
                    {designs.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <EmptyState message="Ningún diseño aún" />
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {designs.map((design) => (
                          <DesignCard
                            key={design.id}
                            design={design}
                            showImage={showImages}
                            getImageUrl={getDisplayImageUrl}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                {/* Artesanal Orders Section */}
                <section>
                  <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Pedidos artesanales ({filteredArtesanalOrders.length}
                      {artesanalFilter !== "all" &&
                        ` / ${artesanalOrders.length}`}
                      )
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          { id: "all" as const, label: "Todos" },
                          { id: "pendiente" as const, label: "Pendiente" },
                          { id: "contactado" as const, label: "Contactado" },
                          { id: "completado" as const, label: "Completado" },
                        ] as const
                      ).map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setArtesanalFilter(f.id)}
                          className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                            artesanalFilter === f.id
                              ? f.id === "pendiente"
                                ? "bg-red-100 text-red-700"
                                : f.id === "contactado"
                                  ? "bg-amber-100 text-amber-800"
                                  : f.id === "completado"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-[#7a4dff] text-white"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                      <button
                        onClick={openTemplateModal}
                        className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                      >
                        Editar mensaje
                      </button>
                      <button
                        onClick={() => setShowImages(!showImages)}
                        className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                      >
                        {showImages ? "Ocultar imágenes" : "Mostrar imágenes"}
                      </button>
                    </div>
                  </div>
                  <div className="h-96 overflow-y-auto rounded-xl border border-gray-200 p-4 bg-white">
                    {filteredArtesanalOrders.length === 0 ? (
                      <div className="flex items-center justify-center h-full min-h-[12rem]">
                        <EmptyState
                          message={
                            artesanalFilter !== "all"
                              ? `Ningún pedido con estado "${STATUS_STYLES[artesanalFilter].label}"`
                              : "Ningún pedido artesanal aún"
                          }
                        />
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {filteredArtesanalOrders.map((order) => (
                          <ArtesanalOrderCard
                            key={order.id}
                            order={order}
                            showImage={showImages}
                            getImageUrl={(url) => url}
                            onStatusChange={handleArtesanalStatusChange}
                            messageTemplate={messageTemplate}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                {/* Product Titles Section */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Descargas ({filteredProducts.length})
                    </h2>
                    <div className="flex gap-2">
                      {(["all", "keycap", "spacebar"] as const).map(
                        (filter) => (
                          <button
                            key={filter}
                            onClick={() => setDownloadFilter(filter)}
                            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                              downloadFilter === filter
                                ? "bg-[#7a4dff] text-white"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            }`}
                          >
                            {filter === "all"
                              ? "Todas"
                              : filter === "keycap"
                                ? "Keycap"
                                : "Spacebar"}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                  <div className="h-96 overflow-y-auto rounded-xl border border-gray-200 p-4 bg-white">
                    {filteredProducts.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <EmptyState message="Ninguna descarga registrada" />
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {filteredProducts.map((product) => (
                          <ProductTitleCard
                            key={product.id}
                            product={product}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}

            {/* Designs Tab */}
            {activeTab === "designs" && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Diseños ({designs.length})
                  </h2>
                  <button
                    onClick={() => setShowImages(!showImages)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    {showImages ? "Ocultar imágenes" : "Mostrar imágenes"}
                  </button>
                </div>
                <div className="h-[calc(100vh-250px)] overflow-y-auto rounded-xl border border-gray-200 p-4 bg-white">
                  {designs.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <EmptyState message="Ningún diseño aún" />
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {designs.map((design) => (
                        <DesignCard
                          key={design.id}
                          design={design}
                          showImage={showImages}
                          getImageUrl={getDisplayImageUrl}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Downloads Tab */}
            {activeTab === "downloads" && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Descargas ({filteredProducts.length})
                  </h2>
                  <div className="flex gap-2">
                    {(["all", "keycap", "spacebar"] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setDownloadFilter(filter)}
                        className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                          downloadFilter === filter
                            ? "bg-[#7a4dff] text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                      >
                        {filter === "all"
                          ? "Todas"
                          : filter === "keycap"
                            ? "Keycap"
                            : "Spacebar"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-[calc(100vh-250px)] overflow-y-auto rounded-xl border border-gray-200 p-4 bg-white">
                  {filteredProducts.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <EmptyState message="Ninguna descarga registrada" />
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {filteredProducts.map((product) => (
                        <ProductTitleCard key={product.id} product={product} />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Artesanal Tab */}
            {activeTab === "artesanal" && (
              <section>
                <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Pedidos artesanales ({filteredArtesanalOrders.length}
                    {artesanalFilter !== "all" &&
                      ` / ${artesanalOrders.length}`}
                    )
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { id: "all" as const, label: "Todos" },
                        { id: "pendiente" as const, label: "Pendiente" },
                        { id: "contactado" as const, label: "Contactado" },
                        { id: "completado" as const, label: "Completado" },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setArtesanalFilter(f.id)}
                        className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                          artesanalFilter === f.id
                            ? f.id === "pendiente"
                              ? "bg-red-100 text-red-700"
                              : f.id === "contactado"
                                ? "bg-amber-100 text-amber-800"
                                : f.id === "completado"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-[#7a4dff] text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                    <button
                      onClick={openTemplateModal}
                      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                      Editar mensaje
                    </button>
                    <button
                      onClick={() => setShowImages(!showImages)}
                      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                      {showImages ? "Ocultar imágenes" : "Mostrar imágenes"}
                    </button>
                  </div>
                </div>
                <div className="h-[calc(100vh-250px)] overflow-y-auto rounded-xl border border-gray-200 p-4 bg-white">
                  {filteredArtesanalOrders.length === 0 ? (
                    <div className="flex items-center justify-center h-full min-h-[16rem]">
                      <EmptyState
                        message={
                          artesanalFilter !== "all"
                            ? `Ningún pedido con estado "${STATUS_STYLES[artesanalFilter].label}"`
                            : "Ningún pedido artesanal aún"
                        }
                      />
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {filteredArtesanalOrders.map((order) => (
                        <ArtesanalOrderCard
                          key={order.id}
                          order={order}
                          showImage={showImages}
                          getImageUrl={(url) => url}
                          onStatusChange={handleArtesanalStatusChange}
                          messageTemplate={messageTemplate}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Message template modal */}
      {showTemplateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowTemplateModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Mensaje personalizado
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Usá {"{{name}}"}, {"{{email}}"} y {"{{number}}"} como
              placeholders. Si el pedido tiene teléfono, se abre WhatsApp; si
              no, email.
            </p>
            <textarea
              value={templateDraft}
              onChange={(e) => setTemplateDraft(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7a4dff] focus:border-transparent resize-none"
              placeholder="Hola {{name}}, gracias por tu pedido..."
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveMessageTemplate}
                className="px-4 py-2 rounded-xl bg-[#7a4dff] hover:bg-[#6b42e6] text-white font-medium transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
