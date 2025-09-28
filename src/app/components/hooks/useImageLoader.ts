import { useState, useEffect } from 'react'

interface ImageProps {
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scaleX: number
  scaleY: number
}

interface UseImageLoaderProps {
  imageFile: File | null
  canvasWidth: number
  canvasHeight: number
}

export function useImageLoader({ imageFile, canvasWidth, canvasHeight }: UseImageLoaderProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [sourceImageSize, setSourceImageSize] = useState<{ width: number; height: number } | null>(null)
  const [imageProps, setImageProps] = useState<ImageProps>({
    x: 0,
    y: 0,
    width: 400,
    height: 300,
    rotation: 0,
    scaleX: 1,
    scaleY: 1
  })

  useEffect(() => {
    if (imageFile) {
      const img = new window.Image()
      img.onload = () => {
        setImage(img)
        setSourceImageSize({ width: img.naturalWidth, height: img.naturalHeight })
        
        // Stretch image to fill the entire container (ignore aspect ratio)
        const newWidth = canvasWidth
        const newHeight = canvasHeight
        const newX = 0
        const newY = 0
        
        // Set initial position (small and centered)
        const initialWidth = newWidth * 0.2
        const initialHeight = newHeight * 0.2
        const initialX = (canvasWidth - initialWidth) / 2
        const initialY = (canvasHeight - initialHeight) / 2
        
        setImageProps(prev => ({
          ...prev,
          width: initialWidth,
          height: initialHeight,
          x: initialX,
          y: initialY
        }))
        
        // Animate to full size with springy animation using Konva tween
        setTimeout(() => {
          setImageProps(prev => ({
            ...prev,
            width: newWidth,
            height: newHeight,
            x: newX,
            y: newY
          }))
        }, 100) // Small delay to ensure initial state is set
      }
      img.src = URL.createObjectURL(imageFile)
      
      return () => {
        URL.revokeObjectURL(img.src)
      }
    } else {
      setImage(null)
      setSourceImageSize(null)
    }
  }, [imageFile, canvasWidth, canvasHeight])

  return {
    image,
    sourceImageSize,
    imageProps,
    setImageProps
  }
}
