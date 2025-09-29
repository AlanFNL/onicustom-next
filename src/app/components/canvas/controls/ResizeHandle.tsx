import { MIN_IMAGE_SIZE } from "../../constants";

interface ResizeHandleProps {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  imageProps: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  originalAspectRatio: number;
  onResize: (newProps: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
  // Temporarily commented out - limit controls
  // disableXMovement?: boolean;
  // disableYMovement?: boolean;
}

export default function ResizeHandle({
  position,
  imageProps,
  originalAspectRatio,
  onResize,
}: // Temporarily commented out - limit controls
// disableXMovement = false,
// disableYMovement = false,
ResizeHandleProps) {
  const getPositionStyles = () => {
    const baseStyles = {
      left: `${imageProps.x}px`,
      top: `${imageProps.y}px`,
    };

    switch (position) {
      case "top-left":
        return {
          ...baseStyles,
          left: `${imageProps.x - 24}px`,
          top: `${imageProps.y - 24}px`,
        };
      case "top-right":
        return {
          ...baseStyles,
          left: `${imageProps.x + imageProps.width - 24}px`,
          top: `${imageProps.y - 24}px`,
        };
      case "bottom-left":
        return {
          ...baseStyles,
          left: `${imageProps.x - 24}px`,
          top: `${imageProps.y + imageProps.height - 24}px`,
        };
      case "bottom-right":
        return {
          ...baseStyles,
          left: `${imageProps.x + imageProps.width - 24}px`,
          top: `${imageProps.y + imageProps.height - 24}px`,
        };
    }
  };

  const getCursor = () => {
    switch (position) {
      case "top-left":
        return "nw-resize";
      case "top-right":
        return "ne-resize";
      case "bottom-left":
        return "sw-resize";
      case "bottom-right":
        return "se-resize";
    }
  };

  const getRotation = () => {
    switch (position) {
      case "top-left":
        return "rotate(180deg)";
      case "top-right":
        return "rotate(270deg)";
      case "bottom-left":
        return "rotate(90deg)";
      case "bottom-right":
        return "rotate(0deg)";
    }
  };

  const handleResize = (deltaX: number, deltaY: number) => {
    const startProps = { ...imageProps };
    let newX = startProps.x;
    let newY = startProps.y;
    let newWidth = startProps.width;
    let newHeight = startProps.height;

    // Apply constraints to delta values
    // Temporarily commented out - limit controls
    // const constrainedDeltaX = disableXMovement ? 0 : deltaX
    // const constrainedDeltaY = disableYMovement ? 0 : deltaY
    const constrainedDeltaX = deltaX;
    const constrainedDeltaY = deltaY;

    // Calculate the dominant resize direction based on which delta is larger
    // This ensures the resize feels natural while maintaining aspect ratio
    const absDeltaX = Math.abs(constrainedDeltaX);
    const absDeltaY = Math.abs(constrainedDeltaY);

    let scaleFactor = 1;

    switch (position) {
      case "top-left":
        // Calculate scale based on the larger delta while maintaining aspect ratio
        if (absDeltaX > 0 && absDeltaY > 0) {
          // Both directions - use the larger delta to determine scale
          const scaleX = Math.max(
            0.1,
            (startProps.width - constrainedDeltaX) / startProps.width
          );
          const scaleY = Math.max(
            0.1,
            (startProps.height - constrainedDeltaY) / startProps.height
          );
          scaleFactor = Math.min(scaleX, scaleY);
        } else if (absDeltaX > 0) {
          // Only horizontal resize
          scaleFactor = Math.max(
            0.1,
            (startProps.width - constrainedDeltaX) / startProps.width
          );
        } else if (absDeltaY > 0) {
          // Only vertical resize
          scaleFactor = Math.max(
            0.1,
            (startProps.height - constrainedDeltaY) / startProps.height
          );
        }

        newWidth = Math.max(MIN_IMAGE_SIZE, startProps.width * scaleFactor);
        newHeight = newWidth / originalAspectRatio;
        newX = startProps.x + (startProps.width - newWidth);
        newY = startProps.y + (startProps.height - newHeight);
        break;

      case "top-right":
        if (absDeltaX > 0 && absDeltaY > 0) {
          // Both directions - use the larger delta to determine scale
          const scaleX = Math.max(
            0.1,
            (startProps.width + constrainedDeltaX) / startProps.width
          );
          const scaleY = Math.max(
            0.1,
            (startProps.height - constrainedDeltaY) / startProps.height
          );
          scaleFactor = Math.min(scaleX, scaleY);
        } else if (absDeltaX > 0) {
          // Only horizontal resize
          scaleFactor = Math.max(
            0.1,
            (startProps.width + constrainedDeltaX) / startProps.width
          );
        } else if (absDeltaY > 0) {
          // Only vertical resize
          scaleFactor = Math.max(
            0.1,
            (startProps.height - constrainedDeltaY) / startProps.height
          );
        }

        newWidth = Math.max(MIN_IMAGE_SIZE, startProps.width * scaleFactor);
        newHeight = newWidth / originalAspectRatio;
        newY = startProps.y + (startProps.height - newHeight);
        break;

      case "bottom-left":
        if (absDeltaX > 0 && absDeltaY > 0) {
          // Both directions - use the larger delta to determine scale
          const scaleX = Math.max(
            0.1,
            (startProps.width - constrainedDeltaX) / startProps.width
          );
          const scaleY = Math.max(
            0.1,
            (startProps.height + constrainedDeltaY) / startProps.height
          );
          scaleFactor = Math.min(scaleX, scaleY);
        } else if (absDeltaX > 0) {
          // Only horizontal resize
          scaleFactor = Math.max(
            0.1,
            (startProps.width - constrainedDeltaX) / startProps.width
          );
        } else if (absDeltaY > 0) {
          // Only vertical resize
          scaleFactor = Math.max(
            0.1,
            (startProps.height + constrainedDeltaY) / startProps.height
          );
        }

        newWidth = Math.max(MIN_IMAGE_SIZE, startProps.width * scaleFactor);
        newHeight = newWidth / originalAspectRatio;
        newX = startProps.x + (startProps.width - newWidth);
        break;

      case "bottom-right":
        if (absDeltaX > 0 && absDeltaY > 0) {
          // Both directions - use the larger delta to determine scale
          const scaleX = Math.max(
            0.1,
            (startProps.width + constrainedDeltaX) / startProps.width
          );
          const scaleY = Math.max(
            0.1,
            (startProps.height + constrainedDeltaY) / startProps.height
          );
          scaleFactor = Math.min(scaleX, scaleY);
        } else if (absDeltaX > 0) {
          // Only horizontal resize
          scaleFactor = Math.max(
            0.1,
            (startProps.width + constrainedDeltaX) / startProps.width
          );
        } else if (absDeltaY > 0) {
          // Only vertical resize
          scaleFactor = Math.max(
            0.1,
            (startProps.height + constrainedDeltaY) / startProps.height
          );
        }

        newWidth = Math.max(MIN_IMAGE_SIZE, startProps.width * scaleFactor);
        newHeight = newWidth / originalAspectRatio;
        break;
    }

    onResize({ x: newX, y: newY, width: newWidth, height: newHeight });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    document.body.style.cursor = getCursor();

    const startX = e.clientX;
    const startY = e.clientY;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      handleResize(deltaX, deltaY);
    };

    const handleMouseUp = () => {
      document.body.style.cursor = "";
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.touches[0];
      const deltaX = t.clientX - startX;
      const deltaY = t.clientY - startY;
      handleResize(deltaX, deltaY);
    };

    const handleTouchEnd = () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
  };

  return (
    <div
      className="absolute w-12 h-12 pointer-events-auto select-none flex items-center justify-center"
      style={{
        ...getPositionStyles(),
        cursor: getCursor(),
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div
        className="w-4 h-4 bg-[#7a4dff]/90 border-2 border-white shadow-lg"
        style={{
          borderRadius: "0 0 16px 0",
          transform: getRotation(),
        }}
      />
    </div>
  );
}
