import { useRef } from 'react'

interface MoveHandleProps {
  imageProps: {
    x: number
    y: number
    width: number
    height: number
  }
  onMove: (deltaX: number, deltaY: number) => void
  disableXMovement?: boolean
  disableYMovement?: boolean
}

export default function MoveHandle({ 
  imageProps, 
  onMove, 
  disableXMovement = false, 
  disableYMovement = false 
}: MoveHandleProps) {
  const lastMousePos = useRef<{ x: number; y: number } | null>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    document.body.style.cursor = 'move'
    
    // Store initial mouse position
    lastMousePos.current = { x: e.clientX, y: e.clientY }

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      
      if (!lastMousePos.current) return
      
      // Calculate incremental movement
      const deltaX = e.clientX - lastMousePos.current.x
      const deltaY = e.clientY - lastMousePos.current.y
      
      // Update last position
      lastMousePos.current = { x: e.clientX, y: e.clientY }
      
      // Apply movement with constraints
      onMove(
        disableXMovement ? 0 : deltaX,
        disableYMovement ? 0 : deltaY
      )
    }

    const handleMouseUp = () => {
      document.body.style.cursor = ''
      lastMousePos.current = null
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    
    // Store initial touch position
    lastMousePos.current = { x: touch.clientX, y: touch.clientY }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      
      if (!lastMousePos.current) return
      
      // Calculate incremental movement
      const deltaX = touch.clientX - lastMousePos.current.x
      const deltaY = touch.clientY - lastMousePos.current.y
      
      // Update last position
      lastMousePos.current = { x: touch.clientX, y: touch.clientY }
      
      // Apply movement with constraints
      onMove(
        disableXMovement ? 0 : deltaX,
        disableYMovement ? 0 : deltaY
      )
    }

    const handleTouchEnd = () => {
      lastMousePos.current = null
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }

    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)
  }

  return (
    <div
      className="absolute w-6 h-6 pointer-events-auto cursor-move select-none"
      style={{
        left: `${imageProps.x + imageProps.width / 2 - 12}px`,
        top: `${imageProps.y + imageProps.height + 13}px`,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className="w-6 h-6 bg-[#7a4dff]/90 border-2 border-white rounded-full shadow-lg flex items-center justify-center">
        <div className="flex flex-col space-y-0.5">
          <div className="w-3 h-0.5 bg-white rounded-full"></div>
          <div className="w-3 h-0.5 bg-white rounded-full"></div>
          <div className="w-3 h-0.5 bg-white rounded-full"></div>
        </div>
      </div>
    </div>
  )
}
