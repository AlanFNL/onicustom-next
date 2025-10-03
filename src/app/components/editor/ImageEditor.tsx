"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Disclaimer from "../ui/Disclaimer";
import DragDropArea from "../ui/DragDropArea";
import EditorWrapper from "./EditorWrapper";
import type { EditorCanvasRef } from "../canvas/EditorCanvas";
import ConfirmationPopup from "../ui/ConfirmationPopup";

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

export default function ImageEditor({
  productId,
  productCards,
  onBack,
}: ImageEditorProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [canvasDataUrl, setCanvasDataUrl] = useState("");
  const canvasRef = useRef<EditorCanvasRef>(null);

  const currentProduct = productCards.find(
    (product) => product.id === productId
  );

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
  };

  const handleConfirmImage = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.getCanvasDataUrl();
      setCanvasDataUrl(dataUrl);
      setIsConfirmationOpen(true);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
        <Disclaimer isVisible={true} />

        {!uploadedFile ? (
          <DragDropArea onFileUpload={handleFileUpload} />
        ) : (
          <div className="space-y-8">
            {/* Canvas */}
            <EditorWrapper
              imageFile={uploadedFile}
              productId={productId}
              canvasRef={canvasRef}
            />

            {/* Action Buttons */}
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
              <motion.button
                onClick={() => setUploadedFile(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200 text-sm sm:text-base whitespace-nowrap"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cambiar Imagen
              </motion.button>

              <motion.button
                onClick={handleConfirmImage}
                className="px-5 py-2 bg-[#7a4dff] text-white rounded-xl font-medium hover:bg-[#6b42e6] transition-colors duration-200 text-sm sm:text-base whitespace-nowrap"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Confirmar Imagen
              </motion.button>
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

      {/* Confirmation Popup */}
      <ConfirmationPopup
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        currentProduct={currentProduct}
        canvasDataUrl={canvasDataUrl}
      />
    </motion.div>
  );
}
