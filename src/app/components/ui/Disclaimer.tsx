"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

/* === Calculadora de fecha de despacho === */
function calcDispatchFriday(
  purchaseDate: Date,
  includeMondayInSameWeek = false
) {
  // JS: 0=Dom, 1=Lun, ..., 6=Sab
  const dow = purchaseDate.getDay();

  // Lunes siguiente (por defecto). Si querés que el lunes cuente para la misma semana, seteá includeMondayInSameWeek=true
  let daysToNextMonday = (8 - dow) % 7; // próximo lunes
  if (!includeMondayInSameWeek && dow === 1) {
    daysToNextMonday = 7; // si es lunes y NO queremos contar ese lunes, pasamos al siguiente
  }

  const nextMonday = new Date(purchaseDate);
  nextMonday.setDate(purchaseDate.getDate() + daysToNextMonday);

  // Viernes de esa semana: lunes + 4 días
  const friday = new Date(nextMonday);
  friday.setDate(nextMonday.getDate() + 4);

  return friday;
}

export function DispatchCalculator() {
  const [value, setValue] = useState<string>("");
  const [result, setResult] = useState<Date | null>(null);
  const [error, setError] = useState<string>("");

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split("T")[0];

  // Clear error and reset result when date changes to valid
  useEffect(() => {
    if (value && value >= today) {
      setError("");
      setResult(null);
    }
  }, [value, today]);

  const handleCalc = () => {
    setError("");
    setResult(null);

    if (!value) {
      setError("Elegí una fecha de compra.");
      return;
    }

    // Check if selected date is in the past
    if (value < today) {
      setError(
        "No podés seleccionar una fecha pasada. Elegí hoy o una fecha futura."
      );
      return;
    }

    // value viene como "YYYY-MM-DD" del <input type="date">
    const [y, m, d] = value.split("-").map(Number);
    const purchase = new Date(y, m - 1, d); // mes 0-index
    if (isNaN(purchase.getTime())) {
      setError("Fecha inválida.");
      return;
    }

    const friday = calcDispatchFriday(
      purchase /* , true  <- usa true si querés que los lunes salgan ese mismo viernes */
    );
    setResult(friday);
  };

  const formatAR = (date: Date) =>
    new Intl.DateTimeFormat("es-AR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);

  return (
    <div className="mt-6 pt-6 border-t border-amber-200">
      <h4 className="mb-4 text-sm font-semibold text-gray-800">
        Calculá cuándo se despacha tu pedido
      </h4>

      <div className="flex max-w-fit flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-2">
            Fecha de compra
          </label>
          <input
            type="date"
            value={value}
            min={today}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[#7a4dff] focus:border-transparent"
          />
        </div>
        <motion.button
          onClick={handleCalc}
          disabled={!value || value < today}
          className={`sm:mt-6 px-5 py-2.5 rounded-xl font-medium transition-colors duration-200 text-sm whitespace-nowrap ${
            !value || value < today
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#7a4dff] text-white hover:bg-[#6b42e6]"
          }`}
          whileHover={{
            scale: !value || value < today ? 1 : 1.02,
          }}
          whileTap={{
            scale: !value || value < today ? 1 : 0.98,
          }}
        >
          Calcular
        </motion.button>
      </div>

      {error && (
        <motion.p
          className="mt-3 text-xs text-red-600 font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.p>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            className="mt-4 rounded-xl bg-white border border-gray-200 p-4 shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          >
            <p className="text-sm text-gray-800 leading-relaxed">
              Tu pedido se despacha el{" "}
              <span className="font-semibold text-[#7a4dff]">
                {formatAR(result)}
              </span>
            </p>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed">
              Iniciamos producción cada{" "}
              <span className="font-medium">lunes</span> y despachamos los{" "}
              <span className="font-medium">viernes</span> de esa semana.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface DisclaimerProps {
  isVisible: boolean;
}

export default function Disclaimer({ isVisible }: DisclaimerProps) {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <motion.div
      className="overflow-hidden"
      animate={{
        height: isVisible ? "auto" : 0,
        marginBottom: isVisible ? 32 : 0,
      }}
      transition={{
        duration: 0.5,
        ease: [0.32, 0.72, 0, 1],
      }}
    >
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            className="bg-amber-50 border border-amber-200 rounded-2xl p-4 md:p-6 lg:p-8 relative"
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -20,
              scale: 0.95,
            }}
            transition={{
              duration: 0.5,
              ease: [0.32, 0.72, 0, 1],
            }}
            style={{
              transformOrigin: "top center",
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.3,
                delay: 0.1,
              }}
            >
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-amber-600 mt-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0 pb-12 md:pb-8">
                  <h3 className="text-base md:text-lg font-medium text-amber-800 mb-2 md:mb-3">
                    INFORMACIÓN IMPORTANTE, ¡POR FAVOR LEÉ!
                  </h3>
                  <div className="space-y-2 md:space-y-3 text-amber-700">
                    {/* <p className="text-xs md:text-sm leading-relaxed">
                      Te recomendamos una imagen de resolución 4K o 300 DPI.
                    </p>
                    <p className="text-xs md:text-sm leading-relaxed">
                      Mantené cualquier imagen o texto importante dentro del{" "}
                      <span className="font-medium text-green-600">
                        área verde
                      </span>
                      . Cualquier cosa fuera de esta área puede perderse en el
                      proceso de impresión.
                    </p> */}
                    {/* <p className="text-xs md:text-sm leading-relaxed">
                      Si no rellenás toda el área de carga y solo llegás hasta
                      la línea verde, el producto final tendrá un borde blanco.
                    </p> */}
                    <p className="text-xs md:text-sm leading-relaxed font-medium">
                      Subir una imagen de baja calidad resultará en una
                      impresión de baja calidad. Imprimimos lo que nos enviás.
                    </p>
                    <p className="text-xs md:text-sm leading-relaxed font-medium">
                      Pasamos a produccion todos los lunes y despachamos todos
                      los viernes. Significa que si compras un MARTES pasa a
                      produccion el LUNES siguiente y se despacha el VIERNES.
                    </p>
                    <p className="text-xs md:text-sm leading-relaxed font-medium">
                      Luego de subir y confirmar la imagen, el editor te
                      redireccionara a la web para completar tu compra.
                    </p>

                    <DispatchCalculator />

                    {/* Tutorial Section */}
                    <div className="mt-6 pt-6 border-t border-amber-200">
                      <div className="flex flex-col max-w-fit justify-start mb-4">
                        <h4 className="text-sm font-semibold text-gray-800">
                          Tutorial de uso
                        </h4>
                        <motion.button
                          onClick={() => setShowVideo(!showVideo)}
                          className="mt-3 px-5 py-2.5 bg-[#7a4dff] text-white rounded-xl font-medium hover:bg-[#6b42e6] transition-colors duration-200 text-sm whitespace-nowrap"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {showVideo ? "Ocultar video" : "Ver video"}
                        </motion.button>
                      </div>

                      {/* Contenedor del video */}
                      <AnimatePresence>
                        {showVideo && (
                          <motion.div
                            className="relative w-full rounded-xl overflow-hidden shadow-md"
                            style={{ paddingTop: "56.25%" }}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{
                              duration: 0.4,
                              ease: [0.32, 0.72, 0, 1],
                            }}
                          >
                            <iframe
                              className="absolute top-0 left-0 w-full h-full"
                              src="https://www.youtube.com/embed/3F6rmb4Ac8w"
                              title="Tutorial de YouTube"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
