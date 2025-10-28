"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

interface ProductCard {
  id: string;
  title: string;
  image: string;
  description: string;
  redirectUrl?: string;
}

interface ImageKitAuth {
  token: string;
  signature: string;
  expire: number;
  publicKey: string;
  urlEndpoint: string;
}

interface ConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  currentProduct: ProductCard | undefined;
  canvasDataUrl: string;
}

export default function ConfirmationPopup({
  isOpen,
  onClose,
  currentProduct,
  canvasDataUrl,
}: ConfirmationPopupProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingState, setLoadingState] = useState<
    "idle" | "uploading" | "saving"
  >("idle");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [imageKitAuth, setImageKitAuth] = useState<ImageKitAuth | null>(null);

  // Generate a random 6-character alphanumeric code
  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Default redirect URLs based on product ID
  const getDefaultRedirectUrl = (productId: string) => {
    const urlMap: Record<string, string> = {
      "mousepad-90x40":
        "https://www.onicaps.online/productos/desk-pad-personalizado/",
      "mousepad-60x40":
        "https://www.onicaps.online/productos/desk-pad-personalizado/",
      "keycap-kda":
        "https://www.onicaps.online/productos/keycap-personalizado/",
      spacebar: "https://www.onicaps.online/productos/spacebar-personalizado/",
    };
    return urlMap[productId] || "https://www.onicaps.online/productos/";
  };

  const dataUrlToFile = useCallback(async () => {
    const response = await fetch(canvasDataUrl);
    const blob = await response.blob();
    return new File([blob], "design.png", { type: blob.type || "image/png" });
  }, [canvasDataUrl]);

  const uploadEndpoint = useMemo(() => {
    if (!imageKitAuth) {
      return "https://upload.imagekit.io/api/v1/files/upload";
    }
    const base = imageKitAuth.urlEndpoint.replace(/\/$/, "");
    return `${base}/files/upload`;
  }, [imageKitAuth]);

  const uploadToImageKit = useCallback(async () => {
    if (!imageKitAuth) {
      throw new Error("Autenticación de ImageKit no disponible");
    }

    const file = await dataUrlToFile();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);
    formData.append("token", imageKitAuth.token);
    formData.append("signature", imageKitAuth.signature);
    formData.append("expire", imageKitAuth.expire.toString());
    formData.append("folder", "/onicustom");
    formData.append("useUniqueFileName", "true");
    formData.append("publicKey", imageKitAuth.publicKey);
    formData.append("apiVersion", "2");

    const response = await fetch(uploadEndpoint, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData?.message || "Error subiendo imagen a ImageKit"
      );
    }

    const data = await response.json();
    if (!data || !data.url) {
      throw new Error("Respuesta inválida de ImageKit");
    }

    if (data.url.startsWith("/")) {
      return `${imageKitAuth.urlEndpoint}${data.url}`;
    }

    return data.url as string;
  }, [dataUrlToFile, imageKitAuth, uploadEndpoint]);

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const response = await fetch("/api/imagekit-auth");
        if (!response.ok) {
          throw new Error("No se pudo obtener la autenticación de ImageKit");
        }
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || "Autenticación inválida");
        }
        setImageKitAuth({
          token: data.token,
          signature: data.signature,
          expire: data.expire,
          publicKey: data.publicKey,
          urlEndpoint: data.urlEndpoint,
        });
      } catch (err) {
        console.error("Error fetching ImageKit auth:", err);
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo preparar la subida de la imagen"
        );
      }
    };

    if (isOpen) {
      setLoadingState("idle");
      setError(null);
      fetchAuth();
    } else {
      setImageKitAuth(null);
    }
  }, [isOpen]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !currentProduct) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (!imageKitAuth) {
        throw new Error(
          "Todavía estamos preparando la subida. Probá de nuevo en un momento."
        );
      }

      setLoadingState("uploading");

      // Convert and upload image directly to ImageKit
      const uploadedUrl = await uploadToImageKit();

      // Generate random code
      const code = generateRandomCode();
      setGeneratedCode(code);

      setLoadingState("saving");

      // Step 2: Save data to Supabase via API route
      const apiResponse = await fetch("/api/save-design", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          productId: currentProduct.id,
          productTitle: currentProduct.title,
          code,
          timestamp: new Date().toISOString(),
          imageUrl: uploadedUrl,
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Request failed: ${apiResponse.status}`
        );
      }

      const result = await apiResponse.json();

      if (result.success) {
        setCurrentStep(2);
      } else {
        throw new Error(result.message || "Failed to save design");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);

      // Log error for debugging (only in development)
      if (process.env.NODE_ENV === "development") {
        console.error("Confirmation process error:", error);
      }
    } finally {
      setIsSubmitting(false);
      setLoadingState("idle");
    }
  };

  const handleFinalizePurchase = () => {
    const redirectUrl =
      currentProduct?.redirectUrl ||
      getDefaultRedirectUrl(currentProduct?.id || "");
    window.open(redirectUrl, "_blank");
    onClose();
    resetState();
  };

  const resetState = () => {
    setCurrentStep(1);
    setEmail("");
    setIsSubmitting(false);
    setLoadingState("idle");
    setGeneratedCode("");
    setIsCopied(false);
    setError(null);
    setAcceptTerms(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      resetState();
      setImageKitAuth(null);
    }, 300); // Reset after animation completes
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to copy code:", err);
      }
    }
  };

  const openTermsAndConditions = () => {
    window.open("/terminos-y-condiciones", "_blank");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            onClick={handleClose}
          />

          {/* Popup */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
              layout
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            >
              {/* Close Button */}
              <motion.button
                onClick={handleClose}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>

              {/* Progress Indicator */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-4">
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 1
                        ? "bg-[#7a4dff] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                    animate={{
                      backgroundColor: currentStep >= 1 ? "#7a4dff" : "#e5e7eb",
                      color: currentStep >= 1 ? "#ffffff" : "#6b7280",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    1
                  </motion.div>
                  <motion.div
                    className="w-8 h-0.5 bg-gray-200"
                    animate={{
                      backgroundColor: currentStep >= 2 ? "#7a4dff" : "#e5e7eb",
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 2
                        ? "bg-[#7a4dff] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                    animate={{
                      backgroundColor: currentStep >= 2 ? "#7a4dff" : "#e5e7eb",
                      color: currentStep >= 2 ? "#ffffff" : "#6b7280",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    2
                  </motion.div>
                </div>
              </div>

              {/* Error Display */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                  >
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        Confirmar Diseño
                      </h2>
                      <p className="text-gray-600">
                        Ingresa tu email para guardar tu diseño personalizado
                      </p>
                    </div>

                    <form onSubmit={handleEmailSubmit} className="space-y-6">
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Email
                        </label>
                        <motion.input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#7a4dff] focus:border-transparent transition-all duration-200"
                          placeholder="tu@email.com"
                          required
                          whileFocus={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        />
                      </div>

                      {/* Terms and Conditions Checkbox */}
                      <div className="flex items-start space-x-3 select-none">
                        <motion.input
                          type="checkbox"
                          id="acceptTerms"
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                          className="mt-1 w-4 h-4 text-[#7a4dff] bg-gray-100 border-gray-300 rounded focus:ring-[#7a4dff] focus:ring-2"
                          required
                          whileFocus={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        />
                        <motion.label
                          htmlFor="acceptTerms"
                          className="text-sm text-gray-700 leading-relaxed"
                          transition={{ duration: 0.2 }}
                        >
                          Acepto los{" "}
                          <button
                            type="button"
                            onClick={openTermsAndConditions}
                            className="text-[#7a4dff] hover:text-[#6b42e6] cursor-pointer underline font-medium transition-colors duration-200"
                          >
                            términos y condiciones
                          </button>
                        </motion.label>
                      </div>

                      <motion.button
                        type="submit"
                        disabled={
                          isSubmitting || !email || !acceptTerms || !imageKitAuth
                        }
                        className="w-full py-3 bg-[#7a4dff] text-white rounded-2xl font-medium hover:bg-[#6b42e6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center space-x-2">
                            <motion.div
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            />
                            <AnimatePresence mode="wait">
                              {loadingState === "uploading" && (
                                <motion.span
                                  key="uploading"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{
                                    duration: 0.3,
                                    ease: [0.32, 0.72, 0, 1],
                                  }}
                                >
                                  Subiendo...
                                </motion.span>
                              )}
                              {loadingState === "saving" && (
                                <motion.span
                                  key="saving"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{
                                    duration: 0.3,
                                    ease: [0.32, 0.72, 0, 1],
                                  }}
                                >
                                  Guardando...
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : imageKitAuth ? (
                          "Guardar Diseño"
                        ) : (
                          "Preparando subida..."
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                  >
                    <div className="text-center mb-8">
                      <motion.div
                        className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                      >
                        <svg
                          className="w-8 h-8 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </motion.div>

                      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        ¡Diseño Guardado!
                      </h2>
                      <p className="text-gray-600 mb-6">
                        Tu diseño se ha guardado exitosamente. Copia el código
                        de confirmación para finalizar tu compra.
                      </p>

                      {/* Code Display */}
                      <motion.div
                        className="bg-gray-50 rounded-2xl p-4 mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                      >
                        <p className="text-sm text-gray-600 mb-2">
                          Código de Confirmación:
                        </p>
                        <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-gray-200">
                          <code className="text-lg font-mono font-semibold text-gray-900">
                            {generatedCode}
                          </code>
                          <motion.button
                            onClick={copyToClipboard}
                            className={`ml-3 p-2 rounded-lg transition-all duration-200 ${
                              isCopied
                                ? "bg-green-100 text-green-600 hover:bg-green-200"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            }`}
                            whileHover={{ scale: isCopied ? 1 : 1.05 }}
                            whileTap={{ scale: isCopied ? 1 : 0.95 }}
                            title={isCopied ? "¡Copiado!" : "Copiar código"}
                            disabled={isCopied}
                          >
                            <AnimatePresence mode="wait">
                              {isCopied ? (
                                <motion.div
                                  key="copied"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  transition={{ duration: 0.2 }}
                                  className="flex items-center space-x-1"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  <span className="text-sm font-medium">
                                    ¡Copiado!
                                  </span>
                                </motion.div>
                              ) : (
                                <motion.svg
                                  key="copy"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  transition={{ duration: 0.2 }}
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </motion.svg>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Pega este código en la página de confirmación para
                          identificar tu pedido
                        </p>
                      </motion.div>
                    </div>

                    <div className="space-y-4">
                      <motion.button
                        onClick={handleFinalizePurchase}
                        className="w-full py-3 bg-[#7a4dff] text-white rounded-2xl font-medium hover:bg-[#6b42e6] transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Finalizar Compra
                      </motion.button>

                      <motion.button
                        onClick={handleClose}
                        className="w-full py-3 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Continuar Editando
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
