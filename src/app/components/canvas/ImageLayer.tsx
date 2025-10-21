import { Layer, Image as KonvaImage, Rect, Group } from 'react-konva'

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
  cornerRadius: number
  onDragEnd: (e: { target: { x: () => number; y: () => number } }) => void
  onDragMove: (e: { target: { x: () => number; y: () => number } }) => void
  onImageHover: (isHovering: boolean) => void
}

export default function ImageLayer({ 
  image, 
  imageProps, 
  canvasWidth, 
  canvasHeight, 
  cornerRadius,
  onDragEnd,
  onDragMove,
  onImageHover
}: ImageLayerProps) {
  const sanitizedRadius = cornerRadius
    ? Math.min(cornerRadius, canvasWidth / 2, canvasHeight / 2)
    : 0

  const clipFunc =
    sanitizedRadius > 0
      ? (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ctx: any
        ) => {
          const r = sanitizedRadius
          const w = canvasWidth
          const h = canvasHeight
          ctx.beginPath()
          ctx.moveTo(r, 0)
          ctx.lineTo(w - r, 0)
          ctx.quadraticCurveTo(w, 0, w, r)
          ctx.lineTo(w, h - r)
          ctx.quadraticCurveTo(w, h, w - r, h)
          ctx.lineTo(r, h)
          ctx.quadraticCurveTo(0, h, 0, h - r)
          ctx.lineTo(0, r)
          ctx.quadraticCurveTo(0, 0, r, 0)
          ctx.closePath()
        }
      : undefined

  return (
    <Layer>
      <Group clipFunc={clipFunc}>
        {/* Background */}
        <Rect
          x={0}
          y={0}
          width={canvasWidth}
          height={canvasHeight}
          fill="white"
          cornerRadius={sanitizedRadius}
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
      </Group>
    </Layer>
  )
}
