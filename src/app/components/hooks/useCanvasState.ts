import { useState, useEffect, useCallback } from "react";
import {
  MOBILE_CONTROLS_TIMEOUT,
  CENTERING_GUIDE_FADE_DURATION,
} from "../constants";

export function useCanvasState() {
  const [isSelected, setIsSelected] = useState(false);
  const [showResizeHandles, setShowResizeHandles] = useState(false);
  const [controlsOpacity, setControlsOpacity] = useState(0);
  const [showCenteringGuides, setShowCenteringGuides] = useState(false);
  const [centeringGuidesOpacity, setCenteringGuidesOpacity] = useState(0);
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const [mobileControlsTimeout, setMobileControlsTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [centeringGuidesTimeout, setCenteringGuidesTimeout] =
    useState<ReturnType<typeof setTimeout> | null>(null);

  // Utility functions
  const isMobileDevice = useCallback(() => {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) ||
      (typeof window !== "undefined" && window.innerWidth < 768)
    );
  }, []);

  // Handle mobile controls timeout
  const handleMobileTouch = useCallback(() => {
    if (!isMobileDevice()) return;

    // Clear any existing timeout
    if (mobileControlsTimeout) {
      clearTimeout(mobileControlsTimeout);
    }

    // Show controls immediately
    setIsSelected(true);
    setShowResizeHandles(true);

    // Set new timeout to hide controls after 5 seconds
    const newTimeout = setTimeout(() => {
      setIsSelected(false);
      setShowResizeHandles(false);
    }, MOBILE_CONTROLS_TIMEOUT);

    setMobileControlsTimeout(newTimeout);
  }, [mobileControlsTimeout, isMobileDevice]);

  // Handle centering guides visibility
  const showCenteringGuidesTemporarily = useCallback(() => {
    // Clear any existing timeout
    if (centeringGuidesTimeout) {
      clearTimeout(centeringGuidesTimeout);
    }

    // Show guides immediately
    setShowCenteringGuides(true);

    // Set timeout to hide guides after fade duration
    const newTimeout = setTimeout(() => {
      setShowCenteringGuides(false);
    }, CENTERING_GUIDE_FADE_DURATION);

    setCenteringGuidesTimeout(newTimeout);
  }, [centeringGuidesTimeout]);

  // Handle image hover
  const handleImageHover = useCallback(
    (isHovering: boolean) => {
      setIsHoveringImage(isHovering);

      if (isHovering) {
        // Clear any existing timeout when hovering
        if (centeringGuidesTimeout) {
          clearTimeout(centeringGuidesTimeout);
        }
        setShowCenteringGuides(true);
      } else {
        // Set timeout to hide guides when not hovering
        const newTimeout = setTimeout(() => {
          setShowCenteringGuides(false);
        }, CENTERING_GUIDE_FADE_DURATION);

        setCenteringGuidesTimeout(newTimeout);
      }
    },
    [centeringGuidesTimeout]
  );

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (mobileControlsTimeout) {
        clearTimeout(mobileControlsTimeout);
      }
      if (centeringGuidesTimeout) {
        clearTimeout(centeringGuidesTimeout);
      }
    };
  }, [mobileControlsTimeout, centeringGuidesTimeout]);

  // Smooth animation for controls
  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      if (isSelected || showResizeHandles) {
        setControlsOpacity((prev) => Math.min(1, prev + 0.15)); // Smooth fade in
        if (controlsOpacity < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      } else {
        setControlsOpacity((prev) => Math.max(0, prev - 0.1)); // Smooth fade out
        if (controlsOpacity > 0) {
          animationFrame = requestAnimationFrame(animate);
        }
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isSelected, showResizeHandles, controlsOpacity]);

  // Smooth animation for centering guides
  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      if (showCenteringGuides) {
        setCenteringGuidesOpacity((prev) => Math.min(1, prev + 0.2)); // Faster fade in
        if (centeringGuidesOpacity < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      } else {
        setCenteringGuidesOpacity((prev) => Math.max(0, prev - 0.15)); // Smooth fade out
        if (centeringGuidesOpacity > 0) {
          animationFrame = requestAnimationFrame(animate);
        }
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [showCenteringGuides, centeringGuidesOpacity]);

  return {
    isSelected,
    setIsSelected,
    showResizeHandles,
    setShowResizeHandles,
    controlsOpacity,
    showCenteringGuides,
    centeringGuidesOpacity,
    isHoveringImage,
    isMobileDevice,
    handleMobileTouch,
    showCenteringGuidesTemporarily,
    handleImageHover,
  };
}
