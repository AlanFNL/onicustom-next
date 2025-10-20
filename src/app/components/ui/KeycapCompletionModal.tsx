"use client";

import { motion, AnimatePresence } from "framer-motion";

interface KeycapCompletionModalProps {
  isOpen: boolean;
  onReset: () => void;
  onRedirect: () => void;
}

export default function KeycapCompletionModal({
  isOpen,
  onReset,
  onRedirect,
}: KeycapCompletionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          />
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 md:p-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg
                    className="h-7 w-7"
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
                </span>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    ¡Listo, tus keycaps se descargaron!
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Elegí si querés crear otra keycap ahora mismo o continuar la
                    compra en la tienda.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
                  <motion.button
                    onClick={onReset}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Crear nueva keycap
                  </motion.button>
                  <motion.button
                    onClick={onRedirect}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#7a4dff] text-white font-semibold hover:bg-[#6b42e6] transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Ir a la tienda
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
