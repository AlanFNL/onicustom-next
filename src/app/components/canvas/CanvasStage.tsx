import { Stage } from 'react-konva'
import { RefObject } from 'react'
import ImageLayer from './ImageLayer'
import GuideLayer from './GuideLayer'

interface CanvasStageProps {
  width: number
  height: number
  image: HTMLImageElement | null
  imageProps: {
    x: number
    y: number
    width: number
    height: number
    rotation: number
    scaleX: number
    scaleY: number
  }
  designWidth: number
  designHeight: number
  showCenteringGuides: boolean
  centeringGuidesOpacity: number
  onDragEnd: (e: { target: { x: () => number; y: () => number } }) => void
  onDragMove: (e: { target: { x: () => number; y: () => number } }) => void
  onMouseMove: () => void
  onTouchStart: () => void
  onClick: (e: { target: unknown }) => void
  onImageHover: (isHovering: boolean) => void
  stageRef: RefObject<unknown>
}

export default function CanvasStage({
  width,
  height,
  image,
  imageProps,
  designWidth,
  designHeight,
  showCenteringGuides,
  centeringGuidesOpacity,
  onDragEnd,
  onDragMove,
  onMouseMove,
  onTouchStart,
  onClick,
  onImageHover,
  stageRef
}: CanvasStageProps) {
  return (
    <Stage 
      width={width} 
      height={height} 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={stageRef as any}
      className="border border-gray-200 rounded-xl touch-none select-none"
      onMouseMove={onMouseMove}
      onMouseLeave={() => {
        // Don't hide handles on mouse leave - they stay visible when selected
      }}
      onTouchStart={onTouchStart}
      onClick={onClick}
    >
      <ImageLayer 
        image={image}
        imageProps={imageProps}
        canvasWidth={width}
        canvasHeight={height}
        onDragEnd={onDragEnd}
        onDragMove={onDragMove}
        onImageHover={onImageHover}
      />
      
      <GuideLayer 
        canvasWidth={width}
        canvasHeight={height}
        designWidth={designWidth}
        designHeight={designHeight}
        showCenteringGuides={showCenteringGuides}
        centeringGuidesOpacity={centeringGuidesOpacity}
        imageProps={imageProps}
      />
    </Stage>
  )
}
