import { Layer, Image as KonvaImage, Rect } from 'react-konva'

interface ImageLayerProps {
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
  canvasWidth: number
  canvasHeight: number
  onDragEnd: (e: { target: { x: () => number; y: () => number } }) => void
  onDragMove: (e: { target: { x: () => number; y: () => number } }) => void
  onImageHover: (isHovering: boolean) => void
}

export default function ImageLayer({ 
  image, 
  imageProps, 
  canvasWidth, 
  canvasHeight, 
  onDragEnd,
  onDragMove,
  onImageHover
}: ImageLayerProps) {
  return (
    <Layer>
      {/* Background */}
      <Rect
        x={0}
        y={0}
        width={canvasWidth}
        height={canvasHeight}
        fill="white"
      />
      
      {/* User image */}
      {image && (
        <KonvaImage
          image={image}
          x={imageProps.x}
          y={imageProps.y}
          width={imageProps.width}
          height={imageProps.height}
          draggable
          onDragEnd={onDragEnd}
          onDragMove={onDragMove}
          onMouseEnter={() => onImageHover(true)}
          onMouseLeave={() => onImageHover(false)}
        />
      )}
    </Layer>
  )
}
