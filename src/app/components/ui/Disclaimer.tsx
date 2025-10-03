"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

/* === Calculadora de fecha de despacho === */
function calcDispatchFriday(purchaseDate: Date, includeMondayInSameWeek = false) {
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

  const handleCalc = () => {
    setError("");
    setResult(null);

    if (!value) {
      setError("Elegí una fecha de compra.");
      return;
    }

    // value viene como "YYYY-MM-DD" del <input type="date">
    const [y, m, d] = value.split("-").map(Number);
    const purchase = new Date(y, m - 1, d); // mes 0-index
    if (isNaN(purchase.getTime())) {
      setError("Fecha inválida.");
      return;
    }

    const friday = calcDispatchFriday(purchase /* , true  <- usa true si querés que los lunes salgan ese mismo viernes */);
    setResult(friday);
  };

  const formatAR = (date: Date) =>
    new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(date);

  return (
    <div className="mt-6 rounded-xl border border-amber-200 bg-white/70 p-4">
      <h4 className="mb-3 text-sm font-semibold text-amber-800">Calculá cuándo se despacha tu pedido, ingresa la fecha en la que estas comprando</h4>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
        />
        <button
          onClick={handleCalc}
          className="w-full max-w-xs rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
        >
          Calcular dia de despacho
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

   {result && (
        <div className="mt-3 rounded-lg bg-amber-50 p-3 text-amber-800">
          <p className="text-sm">
            📦 Tu pedido se despacha el{" "}
            <span className="font-semibold">{formatAR(result)}</span>.
          </p>
          <p className="mt-1 text-xs text-amber-700">
            Regla: iniciamos producción cada <b>lunes</b> y despachamos los{" "}
            <b>viernes</b> de esa semana.
          </p>
        </div>
      )}
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

                    

                    {/* Botón para mostrar el tutorial */}
<button
  onClick={() => setShowVideo(!showVideo)}
  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm"
>
  {showVideo ? "Ocultar tutorial 📺" : "Ver tutorial 📺"}
</button>

{/* Contenedor del video */}
{showVideo && (
  <div className="mt-4 relative w-full" style={{ paddingTop: "56.25%" }}>
    <iframe
      className="absolute top-0 left-0 w-full h-full rounded-lg"
      src="https://www.youtube.com/embed/3F6rmb4Ac8w"
      title="Tutorial de YouTube"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  </div>
)}

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
