"use client";

import { motion } from "framer-motion";
import {
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { useResponsiveCanvas } from "../hooks/useResponsiveCanvas";
import {
  useImageLoader,
  type ImageProps,
  type ImageState,
} from "../hooks/useImageLoader";
import { useCanvasState } from "../hooks/useCanvasState";
import CanvasStage from "./CanvasStage";
import ImageControls from "./controls/ImageControls";
import LayoutControls from "./LayoutControls";
import { ANIMATION_EASING } from "../constants";

interface EditorCanvasProps {
  imageFile: File | null;
  productId: string;
  onValidationChange?: (isValid: boolean) => void;
  initialImageState?: ImageState | null;
  onImageStateChange?: (state: ImageState) => void;
}

const imageStatesEqual = (a: ImageState | null, b: ImageState | null) => {
  if (a === b) return true;
  if (!a || !b) return false;

  const propsA = a.imageProps;
  const propsB = b.imageProps;

  const propsEqual =
    propsA.x === propsB.x &&
    propsA.y === propsB.y &&
    propsA.width === propsB.width &&
    propsA.height === propsB.height &&
    propsA.rotation === propsB.rotation &&
    propsA.scaleX === propsB.scaleX &&
    propsA.scaleY === propsB.scaleY;

  const sourceEqual =
    (a.sourceImageSize === null && b.sourceImageSize === null) ||
    (a.sourceImageSize !== null &&
      b.sourceImageSize !== null &&
      a.sourceImageSize.width === b.sourceImageSize.width &&
      a.sourceImageSize.height === b.sourceImageSize.height);

  const canvasEqual =
    a.canvasSize.width === b.canvasSize.width &&
    a.canvasSize.height === b.canvasSize.height;

  return propsEqual && sourceEqual && canvasEqual;
};

export interface EditorCanvasRef {
  getCanvasDataUrl: () => string;
  isImageFullyCovering: () => boolean;
}

const drawRoundedRectPath = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  width: number,
  height: number,
  radius: number
) => {
  const r = Math.min(radius, width / 2, height / 2);
  if (r <= 0) {
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.closePath();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(width - r, 0);
  ctx.quadraticCurveTo(width, 0, width, r);
  ctx.lineTo(width, height - r);
  ctx.quadraticCurveTo(width, height, width - r, height);
  ctx.lineTo(r, height);
  ctx.quadraticCurveTo(0, height, 0, height - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
};

const EditorCanvas = forwardRef<EditorCanvasRef, EditorCanvasProps>(
  (
    {
      imageFile,
      productId,
      onValidationChange,
      initialImageState = null,
      onImageStateChange,
    },
    ref
  ) => {
    const debugLog = (...args: unknown[]) => {
      if (process.env.NODE_ENV !== "production") {
        console.log("[EditorCanvas]", ...args);
      }
    };

    const stageRef = useRef<unknown>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastLoadedFileRef = useRef<File | null>(imageFile ?? null);
    const lastSentStateRef = useRef<ImageState | null>(null);
    const lastInitialStateRef = useRef<ImageState | null>(initialImageState);
    const autoCoverPendingRef = useRef(true);
    const userInteractedRef = useRef(false);

    // Movement constraint state - Temporarily commented out
    // const [disableXMovement, setDisableXMovement] = useState(false);
    // const [disableYMovement, setDisableYMovement] = useState(false);

    // Custom hooks for state management
    const { displayWidth, displayHeight, design } = useResponsiveCanvas({
      productId,
    });
    const designBorderRadius = design.borderRadius ?? 0;
    const displayBorderRadius =
      designBorderRadius > 0
        ? Math.min(
            (designBorderRadius * displayWidth) / design.width,
            displayWidth / 2,
            displayHeight / 2
          )
        : 0;
    const { image, sourceImageSize, imageProps, setImageProps } =
      useImageLoader({
        imageFile,
        canvasWidth: displayWidth,
        canvasHeight: displayHeight,
        initialImageState,
      });
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
      handleImageHover,
    } = useCanvasState();

    // Movement constraint handlers - Temporarily commented out
    // const handleDisableX = useCallback(() => {
    //   setDisableXMovement((prev) => !prev);
    // }, []);

    // const handleDisableY = useCallback(() => {
    //   setDisableYMovement((prev) => !prev);
    // }, []);

    // Image coverage validation
    const checkImageCoverage = useCallback(() => {
      if (!image || !imageProps) return false;

      const tolerance = 1; // 1px tolerance for floating point precision
      const coversLeft = imageProps.x <= tolerance;
      const coversRight =
        imageProps.x + imageProps.width >= displayWidth - tolerance;
      const coversTop = imageProps.y <= tolerance;
      const coversBottom =
        imageProps.y + imageProps.height >= displayHeight - tolerance;

      return coversLeft && coversRight && coversTop && coversBottom;
    }, [image, imageProps, displayWidth, displayHeight]);

    // Notify parent of validation state changes
    useEffect(() => {
      if (onValidationChange && image && imageProps) {
        const isValid = checkImageCoverage();
        onValidationChange(isValid);
      }
    }, [imageProps, image, checkImageCoverage, onValidationChange]);

    useEffect(() => {
      if (!image || !imageProps || !onImageStateChange) return;

      const nextState: ImageState = {
        imageProps,
        sourceImageSize,
        canvasSize: { width: displayWidth, height: displayHeight },
      };

      if (imageStatesEqual(lastSentStateRef.current, nextState)) {
        return;
      }

      lastSentStateRef.current = nextState;
      onImageStateChange(nextState);
    }, [
      image,
      imageProps,
      sourceImageSize,
      displayWidth,
      displayHeight,
      onImageStateChange,
    ]);

    const applyCoverFill = useCallback(
      (options?: { showGuides?: boolean }) => {
        if (!image || !sourceImageSize) return;

        const imageAspectRatio = sourceImageSize.width / sourceImageSize.height;
        const canvasAspectRatio = displayWidth / displayHeight;

        let newWidth: number;
        let newHeight: number;
        let newX: number;
        let newY: number;

        if (imageAspectRatio > canvasAspectRatio) {
          // Image is wider than canvas - fit to height and crop width
          newHeight = displayHeight;
          newWidth = displayHeight * imageAspectRatio;
          newX = (displayWidth - newWidth) / 2;
          newY = 0;
        } else {
          // Image is taller than canvas - fit to width and crop height
          newWidth = displayWidth;
          newHeight = displayWidth / imageAspectRatio;
          newX = 0;
          newY = (displayHeight - newHeight) / 2;
        }

        debugLog("applyCoverFill calculated props", {
          newX,
          newY,
          newWidth,
          newHeight,
          imageAspectRatio,
          canvasAspectRatio,
        });

        setImageProps({
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
        });

        if (options?.showGuides !== false) {
          showCenteringGuidesTemporarily();
        }
      },
      [
        image,
        sourceImageSize,
        displayWidth,
        displayHeight,
        setImageProps,
        showCenteringGuidesTemporarily,
      ]
    );

    useEffect(() => {
      if (
        !imageStatesEqual(
          lastInitialStateRef.current,
          initialImageState ?? null
        )
      ) {
        lastInitialStateRef.current = initialImageState ?? null;
        autoCoverPendingRef.current = !initialImageState;
        if (!initialImageState) {
          userInteractedRef.current = false;
        }
        debugLog("initialImageState changed", {
          hasState: !!initialImageState,
          autoCoverPending: autoCoverPendingRef.current,
        });
      }
    }, [initialImageState]);

    useEffect(() => {
      debugLog("imageFile changed", {
        fileChanged: imageFile !== lastLoadedFileRef.current,
        hasImageFile: !!imageFile,
      });
      if (imageFile && imageFile !== lastLoadedFileRef.current) {
        lastLoadedFileRef.current = imageFile;
        autoCoverPendingRef.current = true;
        userInteractedRef.current = false;
        lastSentStateRef.current = null;
      } else if (!imageFile) {
        lastLoadedFileRef.current = null;
        lastSentStateRef.current = null;
        autoCoverPendingRef.current = false;
        userInteractedRef.current = false;
      }
    }, [imageFile]);

    useEffect(() => {
      debugLog("image loader state updated", {
        hasImage: !!image,
        hasImageProps: !!imageProps,
        sourceImageSize,
        autoCoverPending: autoCoverPendingRef.current,
      });
    }, [image, imageProps, sourceImageSize]);

    useEffect(() => {
      if (!image || !imageProps || !sourceImageSize) {
        return;
      }

      const isCovering = checkImageCoverage();
      const shouldEnforce =
        autoCoverPendingRef.current ||
        (!isCovering && !userInteractedRef.current);

      if (!shouldEnforce) {
        return;
      }

      autoCoverPendingRef.current = false;
      debugLog("enforcing cover fill", {
        isCovering,
        userInteracted: userInteractedRef.current,
      });
      applyCoverFill({ showGuides: false });
    }, [
      image,
      imageProps,
      sourceImageSize,
      applyCoverFill,
      checkImageCoverage,
    ]);

    // Auto-adjustment functions
    const handleFillCanvas = useCallback(() => {
      if (!image) return;
      userInteractedRef.current = true;

      // Fill the entire canvas without respecting aspect ratio
      setImageProps({
        x: 0,
        y: 0,
        width: displayWidth,
        height: displayHeight,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      });

      // Show centering guides to indicate the change
      showCenteringGuidesTemporarily();
    }, [
      image,
      displayWidth,
      displayHeight,
      setImageProps,
      showCenteringGuidesTemporarily,
    ]);

    const handleFillCanvasAspect = useCallback(() => {
      if (!image || !sourceImageSize) return;
      userInteractedRef.current = true;

      const imageAspectRatio = sourceImageSize.width / sourceImageSize.height;
      const canvasAspectRatio = displayWidth / displayHeight;

      let newWidth: number;
      let newHeight: number;
      let newX: number;
      let newY: number;

      if (imageAspectRatio > canvasAspectRatio) {
        // Image is wider than canvas - fit to width
        newWidth = displayWidth;
        newHeight = displayWidth / imageAspectRatio;
        newX = 0;
        newY = (displayHeight - newHeight) / 2;
      } else {
        // Image is taller than canvas - fit to height
        newHeight = displayHeight;
        newWidth = displayHeight * imageAspectRatio;
        newX = (displayWidth - newWidth) / 2;
        newY = 0;
      }

      setImageProps({
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      });

      // Show centering guides to indicate the change
      showCenteringGuidesTemporarily();
    }, [
      image,
      sourceImageSize,
      displayWidth,
      displayHeight,
      setImageProps,
      showCenteringGuidesTemporarily,
    ]);

    const handleFillCanvasLarger = useCallback(() => {
      userInteractedRef.current = true;
      applyCoverFill();
    }, [applyCoverFill]);

    // Alignment functions
    const handleAlignLeft = useCallback(() => {
      if (!image || !sourceImageSize || !imageProps) return;

      const imageAspectRatio = sourceImageSize.width / sourceImageSize.height;
      const currentHeight = imageProps.height;
      const newWidth = currentHeight * imageAspectRatio;
      const newX = 0;
      const newY = imageProps.y;

      setImageProps((prev) => ({
        ...((prev ?? imageProps) as ImageProps),
        x: newX,
        y: newY,
        width: newWidth,
      }));

      showCenteringGuidesTemporarily();
    }, [
      image,
      sourceImageSize,
      imageProps,
      setImageProps,
      showCenteringGuidesTemporarily,
    ]);

    const handleAlignCenter = useCallback(() => {
      if (!image || !sourceImageSize || !imageProps) return;

      const imageAspectRatio = sourceImageSize.width / sourceImageSize.height;
      const currentHeight = imageProps.height;
      const newWidth = currentHeight * imageAspectRatio;
      const newX = (displayWidth - newWidth) / 2;
      const newY = imageProps.y;

      setImageProps((prev) => ({
        ...((prev ?? imageProps) as ImageProps),
        x: newX,
        y: newY,
        width: newWidth,
      }));

      showCenteringGuidesTemporarily();
    }, [
      image,
      sourceImageSize,
      imageProps,
      displayWidth,
      setImageProps,
      showCenteringGuidesTemporarily,
    ]);

    const handleAlignRight = useCallback(() => {
      if (!image || !sourceImageSize || !imageProps) return;

      const imageAspectRatio = sourceImageSize.width / sourceImageSize.height;
      const currentHeight = imageProps.height;
      const newWidth = currentHeight * imageAspectRatio;
      const newX = displayWidth - newWidth;
      const newY = imageProps.y;

      setImageProps((prev) => ({
        ...((prev ?? imageProps) as ImageProps),
        x: newX,
        y: newY,
        width: newWidth,
      }));

      showCenteringGuidesTemporarily();
    }, [
      image,
      sourceImageSize,
      imageProps,
      displayWidth,
      setImageProps,
      showCenteringGuidesTemporarily,
    ]);

    const handleAlignTop = useCallback(() => {
      if (!image || !sourceImageSize || !imageProps) return;

      const imageAspectRatio = sourceImageSize.width / sourceImageSize.height;
      const currentWidth = imageProps.width;
      const newHeight = currentWidth / imageAspectRatio;
      const newX = imageProps.x;
      const newY = 0;

      setImageProps((prev) => ({
        ...((prev ?? imageProps) as ImageProps),
        x: newX,
        y: newY,
        height: newHeight,
      }));

      showCenteringGuidesTemporarily();
    }, [
      image,
      sourceImageSize,
      imageProps,
      setImageProps,
      showCenteringGuidesTemporarily,
    ]);

    const handleAlignMiddle = useCallback(() => {
      if (!image || !sourceImageSize || !imageProps) return;

      const imageAspectRatio = sourceImageSize.width / sourceImageSize.height;
      const currentWidth = imageProps.width;
      const newHeight = currentWidth / imageAspectRatio;
      const newX = imageProps.x;
      const newY = (displayHeight - newHeight) / 2;

      setImageProps((prev) => ({
        ...((prev ?? imageProps) as ImageProps),
        x: newX,
        y: newY,
        height: newHeight,
      }));

      showCenteringGuidesTemporarily();
    }, [
      image,
      sourceImageSize,
      imageProps,
      displayHeight,
      setImageProps,
      showCenteringGuidesTemporarily,
    ]);

    const handleAlignBottom = useCallback(() => {
      if (!image || !sourceImageSize || !imageProps) return;

      const imageAspectRatio = sourceImageSize.width / sourceImageSize.height;
      const currentWidth = imageProps.width;
      const newHeight = currentWidth / imageAspectRatio;
      const newX = imageProps.x;
      const newY = displayHeight - newHeight;

      setImageProps((prev) => ({
        ...((prev ?? imageProps) as ImageProps),
        x: newX,
        y: newY,
        height: newHeight,
      }));

      showCenteringGuidesTemporarily();
    }, [
      image,
      sourceImageSize,
      imageProps,
      displayHeight,
      setImageProps,
      showCenteringGuidesTemporarily,
    ]);

    // Expose canvas export functionality to parent component
    useImperativeHandle(ref, () => ({
      isImageFullyCovering: () => checkImageCoverage(),
      getCanvasDataUrl: () => {
        if (stageRef.current && image && imageProps) {
          // Create a new temporary stage for clean export at design/original pixel size
          // Determine export scale to avoid downscaling the original image
          let exportScale = 1;
          if (sourceImageSize) {
            const scaleToDesign = design.width / displayWidth;
            const placedImageWidthInDesign = imageProps.width * scaleToDesign;
            const placedImageHeightInDesign = imageProps.height * scaleToDesign;

            const scaleByWidth =
              sourceImageSize.width / Math.max(1, placedImageWidthInDesign);
            const scaleByHeight =
              sourceImageSize.height / Math.max(1, placedImageHeightInDesign);

            // Use the limiting dimension to preserve detail without upscaling beyond source
            exportScale = Math.max(1, Math.min(scaleByWidth, scaleByHeight));
          }

          const exportWidth = Math.round(design.width * exportScale);
          const exportHeight = Math.round(design.height * exportScale);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const tempStage = new (window as any).Konva.Stage({
            container: document.createElement("div"),
            width: exportWidth,
            height: exportHeight,
          });

          // Create a new layer
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const tempLayer = new (window as any).Konva.Layer();
          tempStage.add(tempLayer);

          const exportCornerRadius =
            designBorderRadius > 0
              ? Math.min(
                  designBorderRadius * exportScale,
                  exportWidth / 2,
                  exportHeight / 2
                )
              : 0;

          if (exportCornerRadius > 0) {
            tempLayer.clipFunc((ctx: unknown) => {
              drawRoundedRectPath(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ctx as any,
                exportWidth,
                exportHeight,
                exportCornerRadius
              );
            });
          }

          // Add white background
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const background = new (window as any).Konva.Rect({
            x: 0,
            y: 0,
            width: exportWidth,
            height: exportHeight,
            fill: "white",
            cornerRadius: exportCornerRadius,
          });
          tempLayer.add(background);

          // Map display coordinates to design coordinates for precise export
          const scaleToDesign = design.width / displayWidth;

          // Add user image with current position and size (scaled to design size)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const tempImage = new (window as any).Konva.Image({
            x: imageProps.x * scaleToDesign * exportScale,
            y: imageProps.y * scaleToDesign * exportScale,
            width: imageProps.width * scaleToDesign * exportScale,
            height: imageProps.height * scaleToDesign * exportScale,
            image: image,
          });
          tempLayer.add(tempImage);

          // Draw the temporary stage
          tempLayer.draw();

          // Export the clean stage
          const dataURL = tempStage.toDataURL({
            mimeType: "image/png",
            quality: 1,
            pixelRatio: 1,
          });

          // Clean up
          tempStage.destroy();

          return dataURL;
        }
        return "";
      },
    }));

    // Event handlers
    const handleImageDragEnd = useCallback(
      (e: { target: { x: () => number; y: () => number } }) => {
        if (!imageProps) return;
        userInteractedRef.current = true;
        setImageProps((prev) => {
          const baseline = (prev ?? imageProps) as ImageProps;
          return {
            ...baseline,
            x: e.target.x(),
            y: e.target.y(),
          };
        });
        // Show centering guides when drag ends
        showCenteringGuidesTemporarily();
      },
      [imageProps, setImageProps, showCenteringGuidesTemporarily]
    );

    const handleImageDragMove = useCallback(
      (e: { target: { x: () => number; y: () => number } }) => {
        // Apply movement constraints to direct image dragging
        // Temporarily commented out - limit controls
        // const currentX = e.target.x();
        // const currentY = e.target.y();
        //
        // setImageProps((prev) => ({
        //   ...prev,
        //   x: disableXMovement ? prev.x : currentX,
        //   y: disableYMovement ? prev.y : currentY,
        // }));

        // Show centering guides while dragging
        showCenteringGuidesTemporarily();
      },
      [
        // setImageProps,
        // disableXMovement,
        // disableYMovement,
        showCenteringGuidesTemporarily,
      ]
    );

    const handleMouseMove = useCallback(() => {
      // Only used for any future hover effects if needed
    }, []);

    const handleStageClick = useCallback(
      (e: { target: unknown }) => {
        // For Konva, we need to check if the target is a Konva Image
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const target = e.target as any;
        const clickedOnImage =
          target && target.getClassName && target.getClassName() === "Image";

        if (isMobileDevice()) {
          if (clickedOnImage) {
            handleMobileTouch();
          }
        } else {
          setIsSelected(clickedOnImage);
        }
      },
      [isMobileDevice, handleMobileTouch, setIsSelected]
    );

    const handleContainerClick = useCallback(
      (e: React.MouseEvent) => {
        // If clicking on the container but not on the stage, deselect the image
        if (e.target === e.currentTarget) {
          setIsSelected(false);
        }
      },
      [setIsSelected]
    );

    const handleMove = useCallback(
      (deltaX: number, deltaY: number) => {
        if (!imageProps) return;
        userInteractedRef.current = true;
        setImageProps((prev) => {
          const baseline = (prev ?? imageProps) as ImageProps;
          return {
            ...baseline,
            x: baseline.x + deltaX,
            y: baseline.y + deltaY,
          };
        });
        // Show centering guides when moving with controls
        showCenteringGuidesTemporarily();
      },
      [imageProps, setImageProps, showCenteringGuidesTemporarily]
    );

    const handleResize = useCallback(
      (newProps: { x: number; y: number; width: number; height: number }) => {
        if (!imageProps) return;
        userInteractedRef.current = true;
        setImageProps((prev) => ({
          ...((prev ?? imageProps) as ImageProps),
          ...newProps,
        }));
        // Show centering guides when resizing
        showCenteringGuidesTemporarily();
      },
      [imageProps, setImageProps, showCenteringGuidesTemporarily]
    );

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
          onAlignLeft={handleAlignLeft}
          onAlignCenter={handleAlignCenter}
          onAlignRight={handleAlignRight}
          onAlignTop={handleAlignTop}
          onAlignMiddle={handleAlignMiddle}
          onAlignBottom={handleAlignBottom}
          // Temporarily commented out - limit controls
          // onDisableX={handleDisableX}
          // onDisableY={handleDisableY}
          disabled={!image || !imageProps}
          // Temporarily commented out - limit controls
          // disableXMovement={disableXMovement}
          // disableYMovement={disableYMovement}
        />

        <div
          className="bg-white shadow-lg p-2 relative overflow-visible"
          style={{
            borderRadius: displayBorderRadius || undefined,
          }}
          ref={containerRef}
          onClick={handleContainerClick}
        >
          <div
            className="relative"
            style={{ width: displayWidth, height: displayHeight }}
          >
            {image && imageProps ? (
              <CanvasStage
                width={displayWidth}
                height={displayHeight}
                image={image}
                imageProps={imageProps}
                designWidth={design.width}
                designHeight={design.height}
                borderRadius={displayBorderRadius}
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
            ) : (
              <div className="w-full h-full rounded-[inherit] bg-gray-100/70" />
            )}
          </div>

          {/* ImageControls positioned outside canvas to avoid clipping */}
          {image && imageProps && (
            <ImageControls
              image={image}
              imageProps={imageProps}
              originalAspectRatio={
                sourceImageSize
                  ? sourceImageSize.width / sourceImageSize.height
                  : 1
              }
              controlsOpacity={controlsOpacity}
              isSelected={isSelected}
              showResizeHandles={showResizeHandles}
              onMove={handleMove}
              onResize={handleResize}
              // Temporarily commented out - limit controls
              // disableXMovement={disableXMovement}
              // disableYMovement={disableYMovement}
            />
          )}
        </div>
      </motion.div>
    );
  }
);

EditorCanvas.displayName = "EditorCanvas";

export default EditorCanvas;
