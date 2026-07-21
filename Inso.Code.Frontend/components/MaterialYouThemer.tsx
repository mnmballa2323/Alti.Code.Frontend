"use client";

import { useEffect } from "react";
import { themeFromImage, applyTheme } from "@material/material-color-utilities";

/**
 * GCP Material You Design Themer.
 * Automatically extracts the dominant color from a given brand image and
 * dynamically applies a beautiful, accessible GCP Material You Design
 * color palette to the entire application's CSS variables at runtime.
 */
export function MaterialYouThemer({ imageUrl }: { imageUrl: string }) {
  useEffect(() => {
    if (!imageUrl) return;

    const generateTheme = async () => {
      try {
        const img = new Image();

        img.crossOrigin = "Anonymous";
        img.src = imageUrl;

        img.onload = async () => {
          // Extract the native Material Design 3 Theme
          const theme = await themeFromImage(img);

          // Apply the dynamic theme to the document body natively
          const systemDark = window.matchMedia(
            "(prefers-color-scheme: dark)",
          ).matches;

          applyTheme(theme, { target: document.body, dark: systemDark });
        };
      } catch (error) {
        console.warn(
          "⚠️ [Material You] Failed to extract dynamic theme:",
          error,
        );
      }
    };

    generateTheme();
  }, [imageUrl]);

  return null; // Headless component
}
