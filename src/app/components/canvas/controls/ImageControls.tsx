"use client";

import MoveHandle from "./MoveHandle";
import ResizeHandle from "./ResizeHandle";

interface ImageControlsProps {
  image: HTMLImageElement | null;
  imageProps: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  originalAspectRatio: number;
  controlsOpacity: number;
  isSelected: boolean;
  showResizeHandles: boolean;
  onMove: (deltaX: number, deltaY: number) => void;
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

export default function ImageControls({
  image,
  imageProps,
  originalAspectRatio,
  controlsOpacity,
  isSelected,
  showResizeHandles,
  onMove,
  onResize,
}: // Temporarily commented out - limit controls
// disableXMovement = false,
// disableYMovement = false,
ImageControlsProps) {
  // Show controls if we have an image and either selected or resize handles should be shown
  const shouldShowControls = image && (isSelected || showResizeHandles);

  if (!shouldShowControls) return null;

  return (
    <div
      className="absolute top-2 left-2 pointer-events-none"
      style={{
        opacity: Math.max(controlsOpacity, 0.1),
        width: "calc(100% - 16px)",
        height: "calc(100% - 16px)",
      }}
    >
      {/* Move handle at bottom center */}
      <MoveHandle
        imageProps={imageProps}
        onMove={onMove}
        // Temporarily commented out - limit controls
        // disableXMovement={disableXMovement}
        // disableYMovement={disableYMovement}
      />

      {/* Corner resize handles - Always show when image is selected */}
      {(isSelected || showResizeHandles) && (
        <>
          <ResizeHandle
            position="top-left"
            imageProps={imageProps}
            originalAspectRatio={originalAspectRatio}
            onResize={onResize}
            // Temporarily commented out - limit controls
            // disableXMovement={disableXMovement}
            // disableYMovement={disableYMovement}
          />
          <ResizeHandle
            position="top-right"
            imageProps={imageProps}
            originalAspectRatio={originalAspectRatio}
            onResize={onResize}
            // Temporarily commented out - limit controls
            // disableXMovement={disableXMovement}
            // disableYMovement={disableYMovement}
          />
          <ResizeHandle
            position="bottom-left"
            imageProps={imageProps}
            originalAspectRatio={originalAspectRatio}
            onResize={onResize}
            // Temporarily commented out - limit controls
            // disableXMovement={disableXMovement}
            // disableYMovement={disableYMovement}
          />
          <ResizeHandle
            position="bottom-right"
            imageProps={imageProps}
            originalAspectRatio={originalAspectRatio}
            onResize={onResize}
            // Temporarily commented out - limit controls
            // disableXMovement={disableXMovement}
            // disableYMovement={disableYMovement}
          />
        </>
      )}
    </div>
  );
}
