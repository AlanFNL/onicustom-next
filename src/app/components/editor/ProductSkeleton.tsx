'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface ProductSkeletonProps {
  productId: string
}

export default function ProductSkeleton({ productId }: ProductSkeletonProps) {
  // Product dimensions mapping (same as in EditorCanvas)
  const productDimensions = {
    'mousepad-90x40': { width: 900, height: 400 },
    'mousepad-60x40': { width: 600, height: 400 },
    'keycap-kda': { width: 400, height: 400 },
    'spacebar': { width: 1329, height: 177 }
  }

  const design = productDimensions[productId as keyof typeof productDimensions] || { width: 600, height: 400 }

  // Calculate responsive display size (same logic as EditorCanvas)
  const getDisplaySize = () => {
    if (typeof window === 'undefined') return { width: Math.min(800, design.width), height: Math.min(800, design.width) * (design.height / design.width) }
    
    const viewportWidth = window.innerWidth
    const horizontalFrame = 16 + 2 // Account for padding and border
    const maxVisual = Math.min(800, Math.floor(viewportWidth * (viewportWidth < 768 ? 0.85 : 0.9)) - horizontalFrame)
    const displayWidth = Math.max(100, Math.min(design.width, maxVisual))
    const displayHeight = (displayWidth * design.height) / design.width
    
    return { width: displayWidth, height: displayHeight }
  }

  const [dimensions, setDimensions] = useState(getDisplaySize())

  useEffect(() => {
    const handleResize = () => {
      setDimensions(getDisplaySize())
    }

    handleResize() // Initial calculation
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [design.width, design.height])

  const { width, height } = dimensions

  return (
    <motion.div
      className="w-full flex flex-col items-center space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Product Title Skeleton */}
      <div className="w-full max-w-2xl">
        <div className="h-8 bg-gray-200 rounded-lg animate-pulse mb-2" />
        <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-3/4" />
      </div>

      {/* Canvas Area Skeleton */}
      <div className="relative">
        {/* Main canvas skeleton */}
        <motion.div
          className="bg-gray-100 rounded-2xl border-2 border-gray-200 relative overflow-hidden"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            maxWidth: '100%'
          }}
          animate={{
            background: [
              'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
              'linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)',
              'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)'
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {/* Shimmer effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          
          {/* Product-specific visual elements */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Center placeholder */}
            <div className="w-16 h-16 bg-gray-300 rounded-full opacity-50" />
          </div>

          {/* Border indicators for different products */}
          {productId.includes('mousepad') && (
            <div className="absolute inset-4 border-2 border-dashed border-gray-300 rounded-lg" />
          )}
          
          {productId.includes('keycap') && (
            <div className="absolute inset-8 border-2 border-dashed border-gray-300 rounded-full" />
          )}
          
          {productId === 'spacebar' && (
            <div className="absolute inset-8 border-2 border-dashed border-gray-300 rounded-lg" />
          )}
        </motion.div>

        {/* Loading text */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-gray-600">
                Cargando editor...
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Controls Skeleton */}
      <div className="flex justify-center gap-3">
        <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    </motion.div>
  )
}
