"use client";

import { useEffect, useState } from "react";

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

const PASSWORD = "midisclosed2025";
const STORAGE_KEY = "dash_auth";

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [designs, setDesigns] = useState<Design[]>([]);
  const [productTitles, setProductTitles] = useState<ProductTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImages, setShowImages] = useState(true);
  const [downloadFilter, setDownloadFilter] = useState<
    "all" | "keycap" | "spacebar"
  >("all");
  const [activeTab, setActiveTab] = useState<"all" | "designs" | "downloads">(
    "all"
  );

  // Check localStorage on mount
  useEffect(() => {
    const auth = localStorage.getItem(STORAGE_KEY);
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

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
                        )
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
          </div>
        )}
      </main>
    </div>
  );
}

function DesignCard({
  design,
  showImage,
}: {
  design: Design;
  showImage: boolean;
}) {
  return (
    <a
      href={design.img_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow hover:border-[#7a4dff]"
    >
      <div className="flex items-start gap-6">
        {showImage && (
          <div className="relative group flex-shrink-0">
            <img
              src={design.img_url}
              alt="Design"
              className="w-32 h-32 object-cover rounded-xl border border-gray-200 group-hover:border-[#7a4dff] transition-colors"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
            <div className="absolute top-1 right-1 p-2 bg-black/60 group-hover:bg-black/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </div>
          </div>
        )}
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-gray-900">{design.email}</p>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(design.timestamp).toLocaleString("es-AR")}
              </p>
            </div>
            <span className="px-3 py-1 bg-[#7a4dff]/10 text-[#7a4dff] rounded-full text-sm font-medium flex-shrink-0">
              {design.code}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

function ProductTitleCard({ product }: { product: ProductTitle }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">{product.product_title}</p>
          <p className="text-sm text-gray-600 mt-1">
            {new Date(product.timestamp).toLocaleString("es-AR")}
          </p>
        </div>
        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
          Descargado
        </span>
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
    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
      <div className="text-4xl mb-4">📭</div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}
