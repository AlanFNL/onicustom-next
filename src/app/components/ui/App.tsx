"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import ImageEditor from "../editor/ImageEditor";

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"home" | "editor">("home");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showShadow, setShowShadow] = useState(false);

  const productCards = [
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
      disabled: false,
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

  const handleCardClick = (productId: string) => {
    const product = productCards.find((p) => p.id === productId);
    if (!product || product.disabled) return;

    // 👉 Si tiene redirectUrl, redirige
    if (product.id === "testeomasivo") {
      window.location.href = "https://google.com";
      return;
    }

    // 👉 Si no, abre el editor como siempre
    setSelectedProduct(productId);
    setCurrentView("editor");
  };

  const handleBackToHome = () => {
    setCurrentView("home");
    setSelectedProduct(null);
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Scroll detection for navbar visibility and shadow
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar when scrolling up or at top
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsNavbarVisible(true);
      }
      // Hide navbar when scrolling down (but not immediately)
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsNavbarVisible(false);
      }

      // Show shadow when scrolled at least 50px
      setShowShadow(currentScrollY >= 50);

      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events for performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });
    return () => window.removeEventListener("scroll", throttledScroll);
  }, [lastScrollY]);

  // Close menu when clicking outside or on backdrop
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        isMenuOpen &&
        !target.closest(".mobile-menu") &&
        !target.closest(".hamburger-button")
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  if (currentView === "editor") {
    return (
      <ImageEditor
        productId={selectedProduct!}
        productCards={productCards}
        onBack={handleBackToHome}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-40 bg-white px-4 py-6 md:px-8 transition-shadow duration-300 ${
          showShadow ? "shadow-xs" : ""
        }`}
        initial={{ y: 0 }}
        animate={{ y: isNavbarVisible ? 0 : -100 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 0.8,
        }}
      >
        {/* Logo */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        >
          <img
            src="/assets/logo.jpeg"
            alt="Onicaps Logo"
            className="h-12 w-auto object-contain"
          />
        </motion.div>

        {/* Hamburger Menu */}
        <motion.button
          className="hamburger-button absolute top-6 right-4 md:right-8 p-2 rounded-lg hover:bg-gray-50/80 transition-colors duration-200"
          onClick={handleMenuToggle}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
          whileTap={{ scale: 0.95 }}
          aria-label="Menú"
        >
          <div className="w-6 h-6 flex flex-col justify-center space-y-1.5">
            <motion.span
              className="block h-0.5 bg-gray-800 rounded-full"
              animate={{ rotate: isMenuOpen ? 45 : 0, y: isMenuOpen ? 6 : 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className="block h-0.5 bg-gray-800 rounded-full"
              animate={{ opacity: isMenuOpen ? 0 : 1 }}
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className="block h-0.5 bg-gray-800 rounded-full"
              animate={{ rotate: isMenuOpen ? -45 : 0, y: isMenuOpen ? -6 : 0 }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </motion.button>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            />

            {/* Menu Panel */}
            <motion.div
              className="mobile-menu fixed top-0 right-0 z-50 h-full w-full md:w-80 md:max-w-[85vw] bg-white/95 backdrop-blur-xl border-l border-gray-100/50 shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 40,
                mass: 1,
              }}
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100/50">
                <h2 className="text-xl font-medium text-gray-900">Productos</h2>
                <motion.button
                  onClick={handleMenuToggle}
                  className="p-2 rounded-lg hover:bg-gray-100/50 transition-colors duration-200"
                  whileTap={{ scale: 0.95 }}
                  aria-label="Cerrar menú"
                >
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </motion.button>
              </div>

              {/* Product List */}
              <div className="p-6 space-y-4">
                {productCards.map((product, index) => (
                  <motion.button
                    key={product.id}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-300 group ${
                      product.disabled
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:bg-gray-50/50"
                    }`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                    }}
                    whileHover={
                      product.disabled
                        ? {}
                        : {
                            scale: 1.02,
                            backgroundColor: "rgba(0, 0, 0, 0.02)",
                          }
                    }
                    whileTap={product.disabled ? {} : { scale: 0.98 }}
                    onClick={() => {
                      if (!product.disabled) {
                        handleCardClick(product.id);
                        setIsMenuOpen(false);
                      }
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className={`font-medium transition-colors duration-200 ${
                              product.disabled
                                ? "text-gray-500"
                                : "text-gray-900 group-hover:text-[#7a4dff]"
                            }`}
                          >
                            {product.title}
                          </h3>
                        </div>
                        <p
                          className={`text-sm leading-snug ${
                            product.disabled ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {product.description}
                        </p>
                      </div>
                      <motion.div
                        className={`transition-colors duration-200 ${
                          product.disabled
                            ? "text-gray-300"
                            : "text-gray-400 group-hover:text-[#7a4dff]"
                        }`}
                        whileHover={product.disabled ? {} : { x: 4 }}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </motion.div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Menu Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100/50">
                <div className="grid grid-cols-3 gap-4 md:flex md:justify-center md:space-x-6">
                  <motion.a
                    href="https://onicaps.online"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center space-y-1 text-gray-600 hover:text-[#7a4dff] transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    <span className="text-xs font-medium text-center">
                      onicaps.online
                    </span>
                  </motion.a>

                  <motion.a
                    href="https://instagram.com/oni.caps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center space-y-1 text-gray-600 hover:text-[#7a4dff] transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    <span className="text-xs font-medium text-center">
                      oni.caps
                    </span>
                  </motion.a>

                  <motion.a
                    href="https://tiktok.com/@oni.caps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center space-y-1 text-gray-600 hover:text-[#7a4dff] transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                    <span className="text-xs font-medium text-center">
                      @oni.caps
                    </span>
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="px-4 py-8 md:px-8 pt-32">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-20 md:mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
          <h1 className="text-5xl md:text-7xl font-light text-gray-900 mb-6 tracking-tight">
            Creá tu diseño
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed">
            Diseños únicos para tu setup. Mousepads y keycaps personalizados con
            la mejor calidad.
          </p>
        </motion.div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto items-stretch">
          {productCards.map((product, index) => (
            <motion.div
              key={product.id}
              className={`group h-full ${
                product.disabled ? "cursor-not-allowed" : "cursor-pointer"
              }`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.5 + index * 0.1,
                ease: [0.32, 0.72, 0, 1],
              }}
              whileTap={product.disabled ? {} : { scale: 0.99 }}
              onClick={() => !product.disabled && handleCardClick(product.id)}
            >
              <div
                className={`rounded-3xl p-8 shadow-sm transition-all duration-500 ease-out border h-full flex flex-col ${
                  product.disabled
                    ? "bg-gray-50/50 border-gray-100/50 opacity-60"
                    : "bg-white hover:shadow-xl border-gray-100/50 hover:border-gray-200/50"
                }`}
              >
                <div className="aspect-square bg-gray-50/50 rounded-2xl mb-6 overflow-hidden flex-shrink-0">
                  <img
                    src={product.image}
                    alt={product.title}
                    className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
                      product.disabled
                        ? "grayscale"
                        : "group-hover:scale-[1.02]"
                    }`}
                  />
                </div>
                <div className="space-y-2 flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className={`text-xl font-medium tracking-tight ${
                        product.disabled ? "text-gray-500" : "text-gray-900"
                      }`}
                    >
                      {product.title}
                    </h3>
                  </div>
                  <p
                    className={`text-sm font-light leading-relaxed ${
                      product.disabled ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {product.description}
                  </p>
                </div>
                <motion.button
                  className={`w-full mt-6 py-3.5 px-6 rounded-2xl font-normal transition-all duration-300 ease-out flex-shrink-0 ${
                    product.disabled
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#7a4dff] text-white hover:bg-[#6b42e6]"
                  }`}
                  whileHover={product.disabled ? {} : { scale: 1.01 }}
                  whileTap={product.disabled ? {} : { scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!product.disabled) {
                      handleCardClick(product.id);
                    }
                  }}
                >
                  {product.disabled ? "Próximamente" : "Personalizar"}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.section
          className="max-w-4xl mx-auto mt-12 md:mt-16"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.95, ease: [0.32, 0.72, 0, 1] }}
        >
          <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/80 p-6 md:p-8 shadow-sm">
            <h2 className="mt-2 text-2xl md:text-3xl font-medium tracking-tight text-gray-900">
              ¿No tenés un diseño definido?
            </h2>
            <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed max-w-3xl">
              Si tenés un boceto, una referencia o una idea escrita, armamos tu
              pedido artesanal paso a paso. Cargá tu imagen y contanos el
              personaje, estilo o detalles que querés.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/artesanal"
                className="inline-flex w-full md:w-fit items-center justify-center md:justify-start text-center md:text-left gap-2 rounded-2xl bg-[#7a4dff] px-6 py-3.5 text-base font-medium text-white hover:bg-[#6b42e6] transition-colors"
              >
                Ir a pedidos con boceto
              </Link>
            </div>
            <p className="text-xs md:text-sm text-gray-500 mt-3">
              Ideal para quienes tienen una idea, pero no un diseño final.
            </p>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-12 px-4 md:px-8 border-t border-gray-100">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1, ease: [0.32, 0.72, 0, 1] }}
        >
          <div className="grid grid-cols-3 gap-4 md:flex md:justify-center md:space-x-8">
            <motion.a
              href="https://onicaps.online"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-2 text-gray-600 hover:text-[#7a4dff] transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span className="font-medium text-xs md:text-sm text-center">
                onicaps.online
              </span>
            </motion.a>

            <motion.a
              href="https://instagram.com/oni.caps"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-2 text-gray-600 hover:text-[#7a4dff] transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span className="font-medium text-xs md:text-sm text-center">
                oni.caps
              </span>
            </motion.a>

            <motion.a
              href="https://tiktok.com/@oni.caps"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-2 text-gray-600 hover:text-[#7a4dff] transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
              <span className="font-medium text-xs md:text-sm text-center">
                @oni.caps
              </span>
            </motion.a>
          </div>
        </motion.div>
      </footer>
    </div>
  );
}

export default App;
