'use client'

import { motion } from 'framer-motion'

interface LayoutControlsProps {
  onFillCanvas: () => void
  onFillCanvasAspect: () => void
  onFillCanvasLarger: () => void
  onDisableX: () => void
  onDisableY: () => void
  disabled: boolean
  disableXMovement?: boolean
  disableYMovement?: boolean
}

export default function LayoutControls({
  onFillCanvas,
  onFillCanvasAspect,
  onFillCanvasLarger,
  onDisableX,
  onDisableY,
  disabled,
  disableXMovement = false,
  disableYMovement = false
}: LayoutControlsProps) {
  return (
    <div className="flex flex-col items-center w-full max-w-4xl mb-6">
      <motion.div 
        className="w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
      >
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          {/* Acciones rápidas Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 text-left mb-3">Acciones rápidas</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
              {/* Fill Canvas (No Aspect Ratio) */}
              <motion.button
                onClick={onFillCanvas}
                disabled={disabled}
                className="flex items-center justify-start md:justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!disabled ? { scale: 1.02 } : {}}
                whileTap={!disabled ? { scale: 0.98 } : {}}
                title="Estirar imagen para llenar todo el canvas (puede distorsionar)"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9h18M9 21V9"/>
                </svg>
                <span>Estirar y Completar</span>
              </motion.button>

              {/* Fill Canvas (Respect Aspect Ratio) */}
              <motion.button
                onClick={onFillCanvasAspect}
                disabled={disabled}
                className="flex items-center justify-start md:justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!disabled ? { scale: 1.02 } : {}}
                whileTap={!disabled ? { scale: 0.98 } : {}}
                title="Ajustar imagen para que quepa completa sin distorsionar"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h10v10H7z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7l10 10M17 7l-10 10"/>
                </svg>
                <span>Mantener RDA</span>
              </motion.button>

              {/* Fill Canvas Larger (Crop) */}
              <motion.button
                onClick={onFillCanvasLarger}
                disabled={disabled}
                className="flex items-center justify-start md:justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!disabled ? { scale: 1.02 } : {}}
                whileTap={!disabled ? { scale: 0.98 } : {}}
                title="Llenar canvas completamente recortando partes de la imagen"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9h18M9 21V9"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7l10 10M17 7l-10 10"/>
                </svg>
                <span>Llenar Manteniendo RDA</span>
              </motion.button>
            </div>

            {/* Disclaimer */}
            <motion.p 
              className="text-xs text-gray-500 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.32, 0.72, 0, 1] }}
            >
              * RDA = Relación de Aspecto (proporciones originales de la imagen)
            </motion.p>
          </div>

          {/* Visual Separator */}
          <div className="border-t border-gray-200 mb-6"></div>

          {/* Limitar controles Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 text-left mb-3">Limitar controles</h3>
            
            <div className="flex flex-col gap-4">
              {/* Disable X Movement Switch */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Solo Vertical</span>
                <motion.button
                  onClick={onDisableX}
                  disabled={disabled}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#7a4dff] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    disableXMovement ? 'bg-[#7a4dff]' : 'bg-gray-200'
                  }`}
                  whileTap={!disabled ? { scale: 0.95 } : {}}
                  title="Bloquear movimiento horizontal (solo vertical)"
                >
                  <motion.span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
                      disableXMovement ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </motion.button>
              </div>

              {/* Disable Y Movement Switch */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Solo Horizontal</span>
                <motion.button
                  onClick={onDisableY}
                  disabled={disabled}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#7a4dff] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    disableYMovement ? 'bg-[#7a4dff]' : 'bg-gray-200'
                  }`}
                  whileTap={!disabled ? { scale: 0.95 } : {}}
                  title="Bloquear movimiento vertical (solo horizontal)"
                >
                  <motion.span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
                      disableYMovement ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
