import { useState, useEffect, useMemo } from "react";

export interface ImageProps {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export interface ImageState {
  imageProps: ImageProps;
  sourceImageSize: { width: number; height: number } | null;
  canvasSize: { width: number; height: number };
}

interface UseImageLoaderProps {
  imageFile: File | null;
  canvasWidth: number;
  canvasHeight: number;
  initialImageState?: ImageState | null;
}

const computeCoverProps = ({
  imageWidth,
  imageHeight,
  canvasWidth,
  canvasHeight,
}: {
  imageWidth: number;
  imageHeight: number;
  canvasWidth: number;
  canvasHeight: number;
}): ImageProps => {
  const imageAspectRatio = imageWidth / imageHeight;
  const canvasAspectRatio = canvasWidth / canvasHeight;

  if (imageAspectRatio > canvasAspectRatio) {
    const height = canvasHeight;
    const width = canvasHeight * imageAspectRatio;
    const x = (canvasWidth - width) / 2;
    return {
      x,
      y: 0,
      width,
      height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    };
  }

  const width = canvasWidth;
  const height = canvasWidth / imageAspectRatio;
  const y = (canvasHeight - height) / 2;
  return {
    x: 0,
    y,
    width,
    height,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
  };
};

const scaleImageProps = (
  props: ImageProps,
  fromSize: { width: number; height: number },
  toSize: { width: number; height: number }
): ImageProps => {
  if (!fromSize.width || !fromSize.height) {
    return props;
  }

  const scaleX = toSize.width / fromSize.width;
  const scaleY = toSize.height / fromSize.height;

  return {
    ...props,
    x: props.x * scaleX,
    y: props.y * scaleY,
    width: props.width * scaleX,
    height: props.height * scaleY,
  };
};

export function useImageLoader({
  imageFile,
  canvasWidth,
  canvasHeight,
  initialImageState = null,
}: UseImageLoaderProps) {
  const debugLog = (...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[useImageLoader]", ...args);
    }
  };

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [sourceImageSize, setSourceImageSize] = useState<
    { width: number; height: number } | null
  >(initialImageState?.sourceImageSize ?? null);

  const scaledInitialProps = useMemo(() => {
    if (!initialImageState) return null;
    debugLog("scaling initial props", {
      originalCanvasSize: initialImageState.canvasSize,
      targetCanvasSize: { width: canvasWidth, height: canvasHeight },
    });
    return scaleImageProps(initialImageState.imageProps, {
      width: initialImageState.canvasSize.width,
      height: initialImageState.canvasSize.height,
    }, {
      width: canvasWidth,
      height: canvasHeight,
    });
  }, [initialImageState, canvasWidth, canvasHeight]);

  const [imageProps, setImageProps] = useState<ImageProps | null>(
    scaledInitialProps
  );

  useEffect(() => {
    let isMounted = true;

    if (!imageFile) {
      setImage(null);
      setSourceImageSize(initialImageState?.sourceImageSize ?? null);
      setImageProps(scaledInitialProps);
      debugLog("cleared image file", {
        hasInitialState: !!initialImageState,
      });
      return;
    }

    const img = new window.Image();
    img.onload = () => {
      if (!isMounted) return;

      debugLog("image loaded", {
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        scaledInitialProps,
      });

      const nextImageProps =
        scaledInitialProps ??
        computeCoverProps({
          imageWidth: img.naturalWidth,
          imageHeight: img.naturalHeight,
          canvasWidth,
          canvasHeight,
        });

      setImageProps(nextImageProps);
      setImage(img);
      setSourceImageSize({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });

      debugLog("set image props from loader", {
        nextImageProps,
      });
    };

    img.src = URL.createObjectURL(imageFile);

    return () => {
      isMounted = false;
      URL.revokeObjectURL(img.src);
    };
  }, [
    imageFile,
    canvasWidth,
    canvasHeight,
    scaledInitialProps,
    initialImageState?.sourceImageSize,
  ]);

  return {
    image,
    sourceImageSize,
    imageProps,
    setImageProps,
  };
}
