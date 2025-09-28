'use client'

import { motion } from 'framer-motion'
import { useRef, useCallback, forwardRef, useImperativeHandle, useState } from 'react'
import { useResponsiveCanvas } from '../hooks/useResponsiveCanvas'
import { useImageLoader } from '../hooks/useImageLoader'
import { useCanvasState } from '../hooks/useCanvasState'
import CanvasStage from './CanvasStage'
import ImageControls from './controls/ImageControls'
import LayoutControls from './LayoutControls'
import { ANIMATION_EASING } from '../constants'

interface EditorCanvasProps {
  imageFile: File | null
  productId: string
}

export interface EditorCanvasRef {
  getCanvasDataUrl: () => string
}

const EditorCanvas = forwardRef<EditorCanvasRef, EditorCanvasProps>(({ imageFile, productId }, ref) => {
  const stageRef = useRef<unknown>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Movement constraint state
  const [disableXMovement, setDisableXMovement] = useState(false)
  const [disableYMovement, setDisableYMovement] = useState(false)

  // Custom hooks for state management
  const { displayWidth, displayHeight, design } = useResponsiveCanvas({ productId })
  const { image, sourceImageSize, imageProps, setImageProps } = useImageLoader({ 
    imageFile, 
    canvasWidth: displayWidth, 
    canvasHeight: displayHeight 
  })
  const { 
    isSelected, 
    setIsSelected, 
    showResizeHandles, 
    controlsOpacity,
    showCenteringGuides,
    centeringGuidesOpacity,
    isHoveringImage,
    isMobileDevice, 
    handleMobileTouch,
    showCenteringGuidesTemporarily,
    handleImageHover
  } = useCanvasState()

  // Movement constraint handlers
  const handleDisableX = useCallback(() => {
    setDisableXMovement(prev => !prev)
  }, [])

  const handleDisableY = useCallback(() => {
    setDisableYMovement(prev => !prev)
  }, [])

  // Auto-adjustment functions
  const handleFillCanvas = useCallback(() => {
    if (!image) return
    
    // Fill the entire canvas without respecting aspect ratio
    setImageProps({
      x: 0,
      y: 0,
      width: displayWidth,
      height: displayHeight,
      rotation: 0,
      scaleX: 1,
      scaleY: 1
    })
    
    // Show centering guides to indicate the change
    showCenteringGuidesTemporarily()
  }, [image, displayWidth, displayHeight, setImageProps, showCenteringGuidesTemporarily])

  const handleFillCanvasAspect = useCallback(() => {
    if (!image || !sourceImageSize) return
    
    const imageAspectRatio = sourceImageSize.width / sourceImageSize.height
    const canvasAspectRatio = displayWidth / displayHeight
    
    let newWidth: number
    let newHeight: number
    let newX: number
    let newY: number
    
    if (imageAspectRatio > canvasAspectRatio) {
      // Image is wider than canvas - fit to width
      newWidth = displayWidth
      newHeight = displayWidth / imageAspectRatio
      newX = 0
      newY = (displayHeight - newHeight) / 2
    } else {
      // Image is taller than canvas - fit to height
      newHeight = displayHeight
      newWidth = displayHeight * imageAspectRatio
      newX = (displayWidth - newWidth) / 2
      newY = 0
    }
    
    setImageProps({
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
      rotation: 0,
      scaleX: 1,
      scaleY: 1
    })
    
    // Show centering guides to indicate the change
    showCenteringGuidesTemporarily()
  }, [image, sourceImageSize, displayWidth, displayHeight, setImageProps, showCenteringGuidesTemporarily])

  const handleFillCanvasLarger = useCallback(() => {
    if (!image || !sourceImageSize) return
    
    const imageAspectRatio = sourceImageSize.width / sourceImageSize.height
    const canvasAspectRatio = displayWidth / displayHeight
    
    let newWidth: number
    let newHeight: number
    let newX: number
    let newY: number
    
    if (imageAspectRatio > canvasAspectRatio) {
      // Image is wider than canvas - fit to height and crop width
      newHeight = displayHeight
      newWidth = displayHeight * imageAspectRatio
      newX = (displayWidth - newWidth) / 2
      newY = 0
    } else {
      // Image is taller than canvas - fit to width and crop height
      newWidth = displayWidth
      newHeight = displayWidth / imageAspectRatio
      newX = 0
      newY = (displayHeight - newHeight) / 2
    }
    
    setImageProps({
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
      rotation: 0,
      scaleX: 1,
      scaleY: 1
    })
    
    // Show centering guides to indicate the change
    showCenteringGuidesTemporarily()
  }, [image, sourceImageSize, displayWidth, displayHeight, setImageProps, showCenteringGuidesTemporarily])

  // Expose canvas export functionality to parent component
  useImperativeHandle(ref, () => ({
    getCanvasDataUrl: () => {
      if (stageRef.current && image) {
        // Create a new temporary stage for clean export at design/original pixel size
        // Determine export scale to avoid downscaling the original image
        let exportScale = 1
        if (sourceImageSize) {
          const scaleToDesign = design.width / displayWidth
          const placedImageWidthInDesign = imageProps.width * scaleToDesign
          const placedImageHeightInDesign = imageProps.height * scaleToDesign

          const scaleByWidth = sourceImageSize.width / Math.max(1, placedImageWidthInDesign)
          const scaleByHeight = sourceImageSize.height / Math.max(1, placedImageHeightInDesign)

          // Use the limiting dimension to preserve detail without upscaling beyond source
          exportScale = Math.max(1, Math.min(scaleByWidth, scaleByHeight))
        }

        const exportWidth = Math.round(design.width * exportScale)
        const exportHeight = Math.round(design.height * exportScale)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tempStage = new (window as any).Konva.Stage({
          container: document.createElement('div'),
          width: exportWidth,
          height: exportHeight
        })
        
        // Create a new layer
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tempLayer = new (window as any).Konva.Layer()
        tempStage.add(tempLayer)
        
        // Add white background
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const background = new (window as any).Konva.Rect({
          x: 0,
          y: 0,
          width: exportWidth,
          height: exportHeight,
          fill: 'white'
        })
        tempLayer.add(background)
        
        // Map display coordinates to design coordinates for precise export
        const scaleToDesign = design.width / displayWidth
        
        // Add user image with current position and size (scaled to design size)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tempImage = new (window as any).Konva.Image({
          x: imageProps.x * scaleToDesign * exportScale,
          y: imageProps.y * scaleToDesign * exportScale,
          width: imageProps.width * scaleToDesign * exportScale,
          height: imageProps.height * scaleToDesign * exportScale,
          image: image
        })
        tempLayer.add(tempImage)
        
        // Draw the temporary stage
        tempLayer.draw()
        
        // Export the clean stage
        const dataURL = tempStage.toDataURL({
          mimeType: 'image/png',
          quality: 1,
          pixelRatio: 1
        })
        
        // Clean up
        tempStage.destroy()
        
        return dataURL
      }
      return ''
    }
  }))

  // Event handlers
  const handleImageDragEnd = useCallback((e: { target: { x: () => number; y: () => number } }) => {
    setImageProps(prev => ({
      ...prev,
      x: e.target.x(),
      y: e.target.y()
    }))
    // Show centering guides when drag ends
    showCenteringGuidesTemporarily()
  }, [setImageProps, showCenteringGuidesTemporarily])

  const handleImageDragMove = useCallback((e: { target: { x: () => number; y: () => number } }) => {
    // Apply movement constraints to direct image dragging
    const currentX = e.target.x()
    const currentY = e.target.y()
    
    setImageProps(prev => ({
      ...prev,
      x: disableXMovement ? prev.x : currentX,
      y: disableYMovement ? prev.y : currentY
    }))
    
    // Show centering guides while dragging
    showCenteringGuidesTemporarily()
  }, [setImageProps, disableXMovement, disableYMovement, showCenteringGuidesTemporarily])

  const handleMouseMove = useCallback(() => {
    // Only used for any future hover effects if needed
  }, [])

  const handleStageClick = useCallback((e: { target: unknown }) => {
    // For Konva, we need to check if the target is a Konva Image
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const target = e.target as any
    const clickedOnImage = target && target.getClassName && target.getClassName() === 'Image'
    
    if (isMobileDevice()) {
      if (clickedOnImage) {
        handleMobileTouch()
      }
    } else {
      setIsSelected(clickedOnImage)
    }
  }, [isMobileDevice, handleMobileTouch, setIsSelected])

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    // If clicking on the container but not on the stage, deselect the image
    if (e.target === e.currentTarget) {
      setIsSelected(false)
    }
  }, [setIsSelected])

  const handleMove = useCallback((deltaX: number, deltaY: number) => {
    setImageProps(prev => ({
      ...prev,
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }))
    // Show centering guides when moving with controls
    showCenteringGuidesTemporarily()
  }, [setImageProps, showCenteringGuidesTemporarily])

  const handleResize = useCallback((newProps: { x: number; y: number; width: number; height: number }) => {
    setImageProps(prev => ({
      ...prev,
      ...newProps
    }))
    // Show centering guides when resizing
    showCenteringGuidesTemporarily()
  }, [setImageProps, showCenteringGuidesTemporarily])

  return (
    <motion.div 
      className="flex flex-col items-center relative max-w-[95vw] landscape:max-w-[90vw] mx-auto"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3, ease: ANIMATION_EASING }}
    >
      {/* Layout Controls */}
      <LayoutControls 
        onFillCanvas={handleFillCanvas}
        onFillCanvasAspect={handleFillCanvasAspect}
        onFillCanvasLarger={handleFillCanvasLarger}
        onDisableX={handleDisableX}
        onDisableY={handleDisableY}
        disabled={!image}
        disableXMovement={disableXMovement}
        disableYMovement={disableYMovement}
      />

      <div className="bg-white rounded-2xl shadow-lg p-2 relative overflow-visible" ref={containerRef} onClick={handleContainerClick}>
        <div className="relative" style={{ width: displayWidth, height: displayHeight }}>
          <CanvasStage 
            width={displayWidth}
            height={displayHeight}
            image={image}
            imageProps={imageProps}
            designWidth={design.width}
            designHeight={design.height}
            showCenteringGuides={showCenteringGuides}
            centeringGuidesOpacity={centeringGuidesOpacity}
            onDragEnd={handleImageDragEnd}
            onDragMove={handleImageDragMove}
            onMouseMove={handleMouseMove}
            onTouchStart={handleMobileTouch}
            onClick={handleStageClick}
            onImageHover={handleImageHover}
            stageRef={stageRef}
          />
        </div>

        {/* ImageControls positioned outside canvas to avoid clipping */}
        <ImageControls 
          image={image}
          imageProps={imageProps}
          controlsOpacity={controlsOpacity}
          isSelected={isSelected}
          showResizeHandles={showResizeHandles}
          onMove={handleMove}
          onResize={handleResize}
          disableXMovement={disableXMovement}
          disableYMovement={disableYMovement}
        />
      </div>
    </motion.div>
  )
})

EditorCanvas.displayName = 'EditorCanvas'

export default EditorCanvas