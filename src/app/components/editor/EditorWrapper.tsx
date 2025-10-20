'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import ProductSkeleton from './ProductSkeleton'
import type { EditorCanvasRef } from '../canvas/EditorCanvas'
import type { ImageState } from '../hooks/useImageLoader'

// Dynamically import EditorCanvas to avoid SSR issues
const EditorCanvas = dynamic(() => import('../canvas/EditorCanvas'), {
  ssr: false,
  loading: () => null // We handle loading with our own skeleton
})

interface EditorWrapperProps {
  imageFile: File | null
  productId: string
  canvasRef: React.RefObject<EditorCanvasRef | null>
  onValidationChange?: (isValid: boolean) => void
  initialImageState?: ImageState | null
  onImageStateChange?: (state: ImageState) => void
}

export default function EditorWrapper({
  imageFile,
  productId,
  canvasRef,
  onValidationChange,
  initialImageState = null,
  onImageStateChange,
}: EditorWrapperProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isEditorReady, setIsEditorReady] = useState(false)

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false)
      setIsEditorReady(true)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ProductSkeleton productId={productId} />
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {isEditorReady && (
              <EditorCanvas 
                ref={canvasRef} 
                imageFile={imageFile} 
                productId={productId}
                onValidationChange={onValidationChange}
                initialImageState={initialImageState}
                onImageStateChange={onImageStateChange}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
