import { useState, useEffect } from "react";

interface ImageProps {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

interface UseImageLoaderProps {
  imageFile: File | null;
  canvasWidth: number;
  canvasHeight: number;
}

export function useImageLoader({
  imageFile,
  canvasWidth,
  canvasHeight,
}: UseImageLoaderProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [sourceImageSize, setSourceImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [imageProps, setImageProps] = useState<ImageProps>({
    x: 0,
    y: 0,
    width: 400,
    height: 300,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
  });

  useEffect(() => {
    if (imageFile) {
      const img = new window.Image();
      img.onload = () => {
        setImage(img);
        setSourceImageSize({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });

        // Calculate fill canvas dimensions (fill entire space while maintaining aspect ratio)
        const imageAspectRatio = img.naturalWidth / img.naturalHeight;
        const canvasAspectRatio = canvasWidth / canvasHeight;

        let finalWidth: number;
        let finalHeight: number;
        let finalX: number;
        let finalY: number;

        if (imageAspectRatio > canvasAspectRatio) {
          // Image is wider than canvas - fit to height and crop width
          finalHeight = canvasHeight;
          finalWidth = canvasHeight * imageAspectRatio;
          finalX = (canvasWidth - finalWidth) / 2;
          finalY = 0;
        } else {
          // Image is taller than canvas - fit to width and crop height
          finalWidth = canvasWidth;
          finalHeight = canvasWidth / imageAspectRatio;
          finalX = 0;
          finalY = (canvasHeight - finalHeight) / 2;
        }

        // Set initial position (small and centered)
        const initialWidth = finalWidth * 0.2;
        const initialHeight = finalHeight * 0.2;
        const initialX = (canvasWidth - initialWidth) / 2;
        const initialY = (canvasHeight - initialHeight) / 2;

        setImageProps((prev) => ({
          ...prev,
          width: initialWidth,
          height: initialHeight,
          x: initialX,
          y: initialY,
        }));

        // Animate to final size with springy animation using Konva tween
        setTimeout(() => {
          setImageProps((prev) => ({
            ...prev,
            width: finalWidth,
            height: finalHeight,
            x: finalX,
            y: finalY,
          }));
        }, 100); // Small delay to ensure initial state is set
      };
      img.src = URL.createObjectURL(imageFile);

      return () => {
        URL.revokeObjectURL(img.src);
      };
    } else {
      setImage(null);
      setSourceImageSize(null);
    }
  }, [imageFile, canvasWidth, canvasHeight]);

  return {
    image,
    sourceImageSize,
    imageProps,
    setImageProps,
  };
}
