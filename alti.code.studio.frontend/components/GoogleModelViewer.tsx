"use client";

import React, { useEffect, useState } from "react";

/**
 * Google Model Viewer (Apache 2.0 SDK) Integration.
 * Empowers the frontend to autonomously render interactive 3D architectural
 * models natively within the browser, replacing static 2D architecture diagrams.
 */
export function GoogleModelViewer({
  src,
  alt = "3D Architecture Model",
}: {
  src: string;
  alt?: string;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Dynamically import the Google Model Viewer web component only on the client
    import("@google/model-viewer")
      .then(() => {
        setIsMounted(true);
      })
      .catch((err) => {
        console.error("Failed to load Google Model Viewer", err);
      });
  }, []);

  if (!isMounted) {
    return (
      <div className="animate-pulse w-full h-[400px] bg-default-100 rounded-xl" />
    );
  }

  return (
    <div className="w-full relative h-[400px] rounded-xl overflow-hidden border border-default-200">
      {/* @ts-ignore - model-viewer is a custom web component */}
      <model-viewer
        ar
        auto-rotate
        camera-controls
        alt={alt}
        shadow-intensity="1"
        src={src}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "transparent",
        }}
      >
        {/* @ts-ignore */}
      </model-viewer>
    </div>
  );
}
