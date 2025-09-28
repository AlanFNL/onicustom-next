import { Layer, Rect, Text, Line } from 'react-konva'
import { BLEED_MARGIN_RATIO, BLEED_STROKE_WIDTH, CENTERING_GUIDE_STROKE_WIDTH, CENTERING_GUIDE_COLOR, CENTERING_GUIDE_OPACITY } from '../constants'

interface GuideLayerProps {
  canvasWidth: number
  canvasHeight: number
  designWidth: number
  designHeight: number
  showCenteringGuides: boolean
  centeringGuidesOpacity: number
  imageProps: {
    x: number
    y: number
    width: number
    height: number
    rotation: number
    scaleX: number
    scaleY: number
  }
}

export default function GuideLayer({ 
  canvasWidth, 
  canvasHeight, 
  designWidth, 
  designHeight,
  showCenteringGuides,
  centeringGuidesOpacity,
  imageProps
}: GuideLayerProps) {
  // Bleed area (red) - exact 2% of original product design size, scaled to display, compensating stroke
  const scaleX = canvasWidth / designWidth
  const scaleY = canvasHeight / designHeight
  const designInsetX = designWidth * BLEED_MARGIN_RATIO
  const designInsetY = designHeight * BLEED_MARGIN_RATIO
  const bleedInsetX = designInsetX * scaleX
  const bleedInsetY = designInsetY * scaleY
  const bleedArea = {
    x: bleedInsetX + BLEED_STROKE_WIDTH / 2,
    y: bleedInsetY + BLEED_STROKE_WIDTH / 2,
    width: canvasWidth - bleedInsetX * 2 - BLEED_STROKE_WIDTH,
    height: canvasHeight - bleedInsetY * 2 - BLEED_STROKE_WIDTH
  }

  // Calculate centering guide positions
  const imageCenterX = imageProps.x + imageProps.width / 2
  const imageCenterY = imageProps.y + imageProps.height / 2
  const canvasCenterX = canvasWidth / 2
  const canvasCenterY = canvasHeight / 2

  return (
    <Layer listening={false}>
      {/* Red bleed line - 2% margin from edges */}
      <Rect
        x={bleedArea.x}
        y={bleedArea.y}
        width={bleedArea.width}
        height={bleedArea.height}
        stroke="green"
        strokeWidth={BLEED_STROKE_WIDTH}
        fill="transparent"
        opacity={0.8}
      />
      {/* Label */}
      <Text
        x={bleedArea.x + 10}
        y={bleedArea.y + 10}
        text="Línea segura (contenido importante hasta aquí)"
        fontSize={12}
        fill="green"
        fontFamily="Arial, sans-serif"
      />

      {/* Centering guide lines - show when moving or hovering */}
      {showCenteringGuides && (
        <>
          {/* Vertical centering line */}
          <Line
            points={[canvasCenterX, 0, canvasCenterX, canvasHeight]}
            stroke={CENTERING_GUIDE_COLOR}
            strokeWidth={CENTERING_GUIDE_STROKE_WIDTH}
            opacity={centeringGuidesOpacity * CENTERING_GUIDE_OPACITY}
            dash={[5, 5]}
          />
          
          {/* Horizontal centering line */}
          <Line
            points={[0, canvasCenterY, canvasWidth, canvasCenterY]}
            stroke={CENTERING_GUIDE_COLOR}
            strokeWidth={CENTERING_GUIDE_STROKE_WIDTH}
            opacity={centeringGuidesOpacity * CENTERING_GUIDE_OPACITY}
            dash={[5, 5]}
          />

          {/* Image center indicator - small cross at image center */}
          <Line
            points={[imageCenterX - 10, imageCenterY, imageCenterX + 10, imageCenterY]}
            stroke={CENTERING_GUIDE_COLOR}
            strokeWidth={CENTERING_GUIDE_STROKE_WIDTH}
            opacity={centeringGuidesOpacity * CENTERING_GUIDE_OPACITY}
          />
          <Line
            points={[imageCenterX, imageCenterY - 10, imageCenterX, imageCenterY + 10]}
            stroke={CENTERING_GUIDE_COLOR}
            strokeWidth={CENTERING_GUIDE_STROKE_WIDTH}
            opacity={centeringGuidesOpacity * CENTERING_GUIDE_OPACITY}
          />
        </>
      )}
    </Layer>
  )
}
