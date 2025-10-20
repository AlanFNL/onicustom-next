"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import Disclaimer from "../ui/Disclaimer";
import DragDropArea from "../ui/DragDropArea";
import EditorWrapper from "./EditorWrapper";
import type { EditorCanvasRef } from "../canvas/EditorCanvas";
import ConfirmationPopup from "../ui/ConfirmationPopup";
import Toast from "../ui/Toast";
import { PRODUCT_DIMENSIONS, type ProductId } from "../constants";
import type { ImageProps, ImageState } from "../hooks/useImageLoader";
import KeycapCompletionModal from "../ui/KeycapCompletionModal";

interface ProductCard {
  id: string;
  title: string;
  image: string;
  description: string;
  redirectUrl?: string;
}

interface ImageEditorProps {
  productId: string;
  productCards: ProductCard[];
  onBack: () => void;
}

interface KeycapImage {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
}

const MAX_KEYCAP_IMAGES = 5;
const COVERAGE_WARNING =
  "Cuidado, la imagen no está llenando todo el producto. Ajustala usando los botones o movela manualmente para cubrir todo el espacio.";
const KEYCAP_LIMIT_WARNING =
  "Podés subir hasta 5 keycaps por tanda. Eliminá una o reiniciá para cargar nuevas.";
const KEYCAP_VALIDATION_WARNING =
  "Revisá que todas las keycaps cubran el área completa antes de guardarlas.";
const KEYCAP_EXPORT_ERROR =
  "Tuvimos un problema al preparar la descarga. Probá de nuevo.";

const createImageId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `keycap-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const loadImageFromFile = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = (event) => {
      URL.revokeObjectURL(objectUrl);
      reject(event);
    };

    img.src = objectUrl;
  });

const computeCoverProps = ({
  imageWidth,
  imageHeight,
  canvasWidth,
  canvasHeight,
}: {
  imageWidth: number;
  imageHeight: number;
  canvasWidth: number;
  canvasHeight: number;
}): ImageProps => {
  const imageAspectRatio = imageWidth / imageHeight;
  const canvasAspectRatio = canvasWidth / canvasHeight;

  if (imageAspectRatio > canvasAspectRatio) {
    const height = canvasHeight;
    const width = canvasHeight * imageAspectRatio;
    const x = (canvasWidth - width) / 2;
    return {
      x,
      y: 0,
      width,
      height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    };
  }

  const width = canvasWidth;
  const height = canvasWidth / imageAspectRatio;
  const y = (canvasHeight - height) / 2;
  return {
    x: 0,
    y,
    width,
    height,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
  };
};

const exportKeycapCanvas = async ({
  file,
  state,
  design,
}: {
  file: File;
  state?: ImageState;
  design: { width: number; height: number };
}) => {
  if (typeof window === "undefined") {
    throw new Error("Exportación disponible sólo en el navegador.");
  }

  const imageElement = await loadImageFromFile(file);
  const intrinsicSize = {
    width: imageElement.naturalWidth,
    height: imageElement.naturalHeight,
  };

  const canvasSize = state?.canvasSize ?? {
    width: design.width,
    height: design.height,
  };

  const imageProps =
    state?.imageProps ??
    computeCoverProps({
      imageWidth: intrinsicSize.width,
      imageHeight: intrinsicSize.height,
      canvasWidth: canvasSize.width,
      canvasHeight: canvasSize.height,
    });

  const sourceImageSize = state?.sourceImageSize ?? intrinsicSize;

  const scaleToDesign = design.width / canvasSize.width;

  const placedWidthInDesign = imageProps.width * scaleToDesign;
  const placedHeightInDesign = imageProps.height * scaleToDesign;

  const scaleByWidth = sourceImageSize.width / Math.max(1, placedWidthInDesign);
  const scaleByHeight =
    sourceImageSize.height / Math.max(1, placedHeightInDesign);

  const exportScale = Math.max(1, Math.min(scaleByWidth, scaleByHeight));

  const exportWidth = Math.round(design.width * exportScale);
  const exportHeight = Math.round(design.height * exportScale);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tempStage = new (window as any).Konva.Stage({
    container: document.createElement("div"),
    width: exportWidth,
    height: exportHeight,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tempLayer = new (window as any).Konva.Layer();
  tempStage.add(tempLayer);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const background = new (window as any).Konva.Rect({
    x: 0,
    y: 0,
    width: exportWidth,
    height: exportHeight,
    fill: "white",
  });
  tempLayer.add(background);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tempImage = new (window as any).Konva.Image({
    x: imageProps.x * scaleToDesign * exportScale,
    y: imageProps.y * scaleToDesign * exportScale,
    width: imageProps.width * scaleToDesign * exportScale,
    height: imageProps.height * scaleToDesign * exportScale,
    image: imageElement,
  });
  tempLayer.add(tempImage);

  tempLayer.draw();

  const dataURL = tempStage.toDataURL({
    mimeType: "image/png",
    quality: 1,
    pixelRatio: 1,
  });

  tempStage.destroy();

  const response = await fetch(dataURL);
  return response.blob();
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
};

const delay = (ms: number) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

export default function ImageEditor({
  productId,
  productCards,
  onBack,
}: ImageEditorProps) {
  const debugLog = useCallback((...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[ImageEditor]", ...args);
    }
  }, []);

  const isKeycap = productId === "keycap-kda";
  const canvasRef = useRef<EditorCanvasRef>(null);
  const moreUploadsInputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<Set<string>>(new Set());

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [canvasDataUrl, setCanvasDataUrl] = useState("");
  const [isImageValid, setIsImageValid] = useState(true);

  const [keycapImages, setKeycapImages] = useState<KeycapImage[]>([]);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [imageStates, setImageStates] = useState<Record<string, ImageState>>(
    {}
  );
  const [validationMap, setValidationMap] = useState<Record<string, boolean>>(
    {}
  );
  const [isSavingImages, setIsSavingImages] = useState(false);
  const [isCompletionOpen, setIsCompletionOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState(COVERAGE_WARNING);
  const [toastType, setToastType] = useState<"warning" | "error" | "success">(
    "warning"
  );
  const [showToast, setShowToast] = useState(false);

  const currentProduct = productCards.find(
    (product) => product.id === productId
  );

  const designSize = PRODUCT_DIMENSIONS[productId as ProductId];

  const activeKeycap = isKeycap
    ? keycapImages.find((image) => image.id === activeImageId) ?? null
    : null;

  const currentFile = isKeycap ? activeKeycap?.file ?? null : uploadedFile;

  const initialImageState =
    isKeycap && activeKeycap ? imageStates[activeKeycap.id] ?? null : null;

  const remainingKeycapSlots = isKeycap
    ? Math.max(0, MAX_KEYCAP_IMAGES - keycapImages.length)
    : 0;

  const canSaveKeycaps = isKeycap && keycapImages.length > 0;

  const coverageWarning = useCallback(() => {
    setToastType("warning");
    setToastMessage(COVERAGE_WARNING);
    setShowToast(true);
  }, []);

  const handleKeycapUploads = useCallback(
    (files: File[]) => {
      debugLog("handleKeycapUploads invoked", {
        incomingFiles: files.length,
      });
      if (!files.length) return;

      const currentCount = keycapImages.length;
      const slots = MAX_KEYCAP_IMAGES - currentCount;

      if (slots <= 0) {
        setToastType("warning");
        setToastMessage(KEYCAP_LIMIT_WARNING);
        setShowToast(true);
        return;
      }

      const acceptedFiles = files.slice(0, slots);
      const accepted = acceptedFiles.map((file, index) => {
        const id = createImageId();
        const previewUrl = URL.createObjectURL(file);
        previewUrlsRef.current.add(previewUrl);
        return {
          id,
          file,
          previewUrl,
          name: `Keycap ${currentCount + index + 1}`,
        };
      });

      if ((!currentCount || !activeImageId) && accepted.length > 0) {
        setActiveImageId(accepted[0].id);
      }

      if (files.length > slots) {
        setToastType("warning");
        setToastMessage(KEYCAP_LIMIT_WARNING);
        setShowToast(true);
      }

      setKeycapImages((prev) => [...prev, ...accepted]);

      if (designSize) {
        void Promise.all(
          accepted.map(async ({ file, id }) => {
            const imageElement = await loadImageFromFile(file);
            const state: ImageState = {
              imageProps: computeCoverProps({
                imageWidth: imageElement.naturalWidth,
                imageHeight: imageElement.naturalHeight,
                canvasWidth: designSize.width,
                canvasHeight: designSize.height,
              }),
              sourceImageSize: {
                width: imageElement.naturalWidth,
                height: imageElement.naturalHeight,
              },
              canvasSize: {
                width: designSize.width,
                height: designSize.height,
              },
            };

            return { id, state };
          })
        ).then((results) => {
          if (!results.length) return;
          debugLog("precomputed keycap states", results);

          setImageStates((prev) => {
            const next = { ...prev };
            for (const { id, state } of results) {
              next[id] = state;
            }
            return next;
          });

          setValidationMap((prev) => {
            const next = { ...prev };
            results.forEach(({ id }) => {
              next[id] = true;
            });
            return next;
          });
        });
      }
    },
    [activeImageId, designSize, keycapImages.length, debugLog]
  );

  const handleFileUpload = (file: File) => {
    if (isKeycap) {
      handleKeycapUploads([file]);
    } else {
      setUploadedFile(file);
    }
  };

  const handleValidationChange = useCallback(
    (isValid: boolean) => {
      if (isKeycap && activeImageId) {
        setValidationMap((prev) => ({
          ...prev,
          [activeImageId]: isValid,
        }));
      } else {
        setIsImageValid(isValid);
      }

      if (!isValid) {
        coverageWarning();
      } else {
        setShowToast(false);
      }
    },
    [activeImageId, coverageWarning, isKeycap]
  );

  const handleImageStateChange = useCallback(
    (state: ImageState) => {
      if (!isKeycap || !activeImageId) return;
      setImageStates((prev) => ({
        ...prev,
        [activeImageId]: state,
      }));
    },
    [activeImageId, isKeycap]
  );

  const handleConfirmImage = () => {
    if (!canvasRef.current) return;

    const isCovering = canvasRef.current.isImageFullyCovering();
    if (!isCovering) {
      coverageWarning();
      return;
    }

    const dataUrl = canvasRef.current.getCanvasDataUrl();
    setCanvasDataUrl(dataUrl);
    setIsConfirmationOpen(true);
  };

  const resetKeycapSession = useCallback(() => {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrlsRef.current.clear();
    setKeycapImages([]);
    setActiveImageId(null);
    setImageStates({});
    setValidationMap({});
    setIsSavingImages(false);
    setIsCompletionOpen(false);
    setShowToast(false);
  }, []);

  const handleSaveKeycaps = useCallback(async () => {
    if (!isKeycap || !designSize) return;
    if (!keycapImages.length) return;

    if (!canSaveKeycaps) {
      setToastType("warning");
      setToastMessage(KEYCAP_VALIDATION_WARNING);
      setShowToast(true);
      return;
    }

    const invalidImage = keycapImages.find(
      (image) => validationMap[image.id] === false
    );
    if (invalidImage) {
      setActiveImageId(invalidImage.id);
      setToastType("warning");
      setToastMessage(KEYCAP_VALIDATION_WARNING);
      setShowToast(true);
      return;
    }

    setIsSavingImages(true);
    try {
      const rendered = [];
      for (let index = 0; index < keycapImages.length; index += 1) {
        const image = keycapImages[index];
        const blob = await exportKeycapCanvas({
          file: image.file,
          state: imageStates[image.id],
          design: designSize,
        });
        rendered.push({
          blob,
          filename: `keycap-${index + 1}.png`,
        });
      }

      if (rendered.length === 1) {
        downloadBlob(rendered[0].blob, rendered[0].filename);
      } else {
        for (const { blob, filename } of rendered) {
          downloadBlob(blob, filename);
          await delay(200); // brief pause keeps browsers from batching downloads incorrectly
        }
      }

      setToastType("success");
      setToastMessage("Descarga lista. Revisá tus archivos para continuar.");
      setShowToast(true);
      setIsCompletionOpen(true);
    } catch (error) {
      setToastType("error");
      setToastMessage(KEYCAP_EXPORT_ERROR);
      setShowToast(true);
      if (process.env.NODE_ENV === "development") {
        console.error("Error exportando keycaps:", error);
      }
    } finally {
      setIsSavingImages(false);
    }
  }, [
    canSaveKeycaps,
    designSize,
    imageStates,
    isKeycap,
    keycapImages,
    validationMap,
  ]);

  useEffect(() => {
    if (!isKeycap || keycapImages.length === 0) {
      if (isKeycap && activeImageId) {
        setActiveImageId(null);
      }
      return;
    }

    const activeExists = keycapImages.some(
      (image) => image.id === activeImageId
    );
    if (!activeExists) {
      setActiveImageId(keycapImages[0].id);
    }
  }, [isKeycap, keycapImages, activeImageId]);

  const handleCompletionReset = useCallback(() => {
    resetKeycapSession();
  }, [resetKeycapSession]);

  const handleCompletionRedirect = useCallback(() => {
    const redirectUrl =
      currentProduct?.redirectUrl ||
      "https://www.onicaps.online/productos/keycap-pro-personalizada/";
    window.open(redirectUrl, "_blank");
    resetKeycapSession();
  }, [currentProduct?.redirectUrl, resetKeycapSession]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(
    () => () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current.clear();
    },
    []
  );

  return (
    <motion.div
      className="min-h-screen bg-gray-50 overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
    >
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-6 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-medium hidden sm:inline">Volver</span>
          </motion.button>

          {/* Enhanced Middle Section */}
          <motion.div
            className="flex flex-col items-center space-y-2 md:space-y-3 flex-1 min-w-0 mx-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: 0.2,
                ease: [0.32, 0.72, 0, 1],
              }}
            >
              <img
                src="/assets/logo.jpeg"
                alt="Onicaps Logo"
                className="h-8 md:h-12 w-auto object-contain"
              />
            </motion.div>

            {/* Product Info */}
            <div className="text-center min-w-0">
              <motion.h1
                className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-900 leading-tight truncate"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.4,
                  ease: [0.32, 0.72, 0, 1],
                }}
              >
                Editando: {currentProduct?.title}
              </motion.h1>
              <motion.p
                className="text-xs md:text-sm text-gray-500 mt-1 font-light hidden sm:block"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.5,
                  ease: [0.32, 0.72, 0, 1],
                }}
              >
                {currentProduct?.description}
              </motion.p>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        <Disclaimer isVisible={true} productId={productId} />

        {(!currentFile && !isKeycap) ||
        (isKeycap && keycapImages.length === 0) ? (
          <DragDropArea
            onFileUpload={!isKeycap ? handleFileUpload : undefined}
            onFilesUpload={isKeycap ? handleKeycapUploads : undefined}
            allowMultiple={isKeycap}
            maxFiles={MAX_KEYCAP_IMAGES}
            remainingSlots={isKeycap ? remainingKeycapSlots : undefined}
          />
        ) : (
          <div className="space-y-8">
            <EditorWrapper
              imageFile={currentFile}
              productId={productId}
              canvasRef={canvasRef}
              onValidationChange={handleValidationChange}
              initialImageState={initialImageState}
              onImageStateChange={isKeycap ? handleImageStateChange : undefined}
            />

            {isKeycap && keycapImages.length > 0 && (
              <motion.div
                className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Keycaps cargadas
                  </h3>
                  {remainingKeycapSlots > 0 && (
                    <>
                      <input
                        ref={moreUploadsInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(event) => {
                          const files = event.target.files;
                          if (!files) return;
                          handleKeycapUploads(Array.from(files));
                          event.target.value = "";
                        }}
                      />
                      <motion.button
                        onClick={() => moreUploadsInputRef.current?.click()}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Agregar más imágenes ({remainingKeycapSlots} disp.)
                      </motion.button>
                    </>
                  )}
                </div>

                <div className="mx-auto flex w-full max-w-[34rem] flex-wrap justify-center gap-3 pb-2">
                  {keycapImages.map((image, index) => {
                    const isActive = image.id === activeImageId;
                    const isValid = validationMap[image.id] !== false;
                    const borderClass = isActive
                      ? "border-[#7a4dff] shadow-lg"
                      : isValid
                      ? "border-gray-200 hover:border-[#7a4dff]/60"
                      : "border-red-300 hover:border-red-400";
                    return (
                      <button
                        key={image.id}
                        onClick={() => setActiveImageId(image.id)}
                        className={`relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all duration-200 ${borderClass}`}
                        title={`Keycap ${index + 1}`}
                      >
                        <img
                          src={image.previewUrl}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[11px] font-semibold text-white bg-black/60 px-2 py-0.5 rounded-full">
                          #{index + 1}
                        </span>
                        {validationMap[image.id] === false && (
                          <span className="absolute top-2 right-2 text-[10px] font-semibold text-white bg-red-500/90 px-1.5 py-0.5 rounded-full">
                            Ajustar
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            <motion.div
              className="flex justify-center gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.4,
                ease: [0.32, 0.72, 0, 1],
              }}
            >
              {isKeycap ? (
                <>
                  <motion.button
                    onClick={resetKeycapSession}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200 text-sm sm:text-base whitespace-nowrap"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSavingImages}
                  >
                    Reiniciar tanda
                  </motion.button>

                  <motion.button
                    onClick={handleSaveKeycaps}
                    disabled={!canSaveKeycaps || isSavingImages}
                    className={`px-5 py-2 rounded-xl font-medium transition-colors duration-200 text-sm sm:text-base whitespace-nowrap ${
                      !canSaveKeycaps || isSavingImages
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-[#7a4dff] text-white hover:bg-[#6b42e6]"
                    }`}
                    whileHover={{
                      scale: !canSaveKeycaps || isSavingImages ? 1 : 1.02,
                    }}
                    whileTap={{
                      scale: !canSaveKeycaps || isSavingImages ? 1 : 0.98,
                    }}
                  >
                    {isSavingImages ? "Guardando..." : "Guardar imagen"}
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button
                    onClick={() => setUploadedFile(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200 text-sm sm:text-base whitespace-nowrap"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cambiar imagen
                  </motion.button>

                  <motion.button
                    onClick={handleConfirmImage}
                    disabled={!isImageValid}
                    className={`px-5 py-2 rounded-xl font-medium transition-colors duration-200 text-sm sm:text-base whitespace-nowrap ${
                      isImageValid
                        ? "bg-[#7a4dff] text-white hover:bg-[#6b42e6]"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    whileHover={{ scale: isImageValid ? 1.02 : 1 }}
                    whileTap={{ scale: isImageValid ? 0.98 : 1 }}
                  >
                    Confirmar imagen
                  </motion.button>
                </>
              )}
            </motion.div>
          </div>
        )}
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

      {!isKeycap && (
        <ConfirmationPopup
          isOpen={isConfirmationOpen}
          onClose={() => setIsConfirmationOpen(false)}
          currentProduct={currentProduct}
          canvasDataUrl={canvasDataUrl}
        />
      )}

      {isKeycap && (
        <KeycapCompletionModal
          isOpen={isCompletionOpen}
          onReset={handleCompletionReset}
          onRedirect={handleCompletionRedirect}
        />
      )}

      <Toast
        isVisible={showToast}
        message={toastMessage}
        type={toastType}
        onClose={() => setShowToast(false)}
        duration={6000}
      />
    </motion.div>
  );
}
