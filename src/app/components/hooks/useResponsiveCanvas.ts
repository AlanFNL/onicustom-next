import { useState, useEffect } from 'react'
import { PRODUCT_DIMENSIONS, type ProductId } from '../constants'

interface UseResponsiveCanvasProps {
  productId: string
}

export function useResponsiveCanvas({ productId }: UseResponsiveCanvasProps) {
  const fallbackDesign = { width: 600, height: 400, borderRadius: 0 }
  const design = PRODUCT_DIMENSIONS[productId as ProductId] || fallbackDesign

  const [displayWidth, setDisplayWidth] = useState<number>(() => {
    if (typeof window === 'undefined') return Math.min(800, design.width)
    const viewportWidth = window.innerWidth
    // Account for inner container padding (p-2 => 8px each side) and 1px border on Stage per side
    const horizontalFrame = 16 + 2
    const maxVisual = Math.min(800, Math.floor(viewportWidth * (viewportWidth < 768 ? 0.85 : 0.9)) - horizontalFrame)
    return Math.max(100, Math.min(design.width, maxVisual))
  })

  const displayHeight = (displayWidth * design.height) / design.width

  useEffect(() => {
    const handleResize = () => {
      const viewportWidth = window.innerWidth
      const horizontalFrame = 16 + 2
      const maxVisual = Math.min(800, Math.floor(viewportWidth * (viewportWidth < 768 ? 0.85 : 0.9)) - horizontalFrame)
      setDisplayWidth(prev => {
        const next = Math.max(100, Math.min(design.width, maxVisual))
        return next === prev ? prev : next
      })
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [design.width])

  return {
    displayWidth,
    displayHeight,
    design
  }
}
