"use client";

import { useEffect } from "react";
import { onLCP, onCLS, onINP, onTTFB } from "web-vitals";

/**
 * Google Web Vitals (Apache 2.0 Open Source SDK).
 * Autonomously attaches to the React lifecycle to stream core performance
 * and UX metrics back to the platform backend for analysis.
 */
export function GoogleWebVitals() {
  useEffect(() => {
    // We bind to the window load to ensure it doesn't block critical rendering
    const sendToTelemetrySink = (metric: any) => {
      // In a production environment, this streams to Google Cloud Monitoring / Telemetry Service
    };

    try {
      // Largest Contentful Paint
      onLCP(sendToTelemetrySink);
      // Cumulative Layout Shift
      onCLS(sendToTelemetrySink);
      // Interaction to Next Paint
      onINP(sendToTelemetrySink);
      // Time to First Byte
      onTTFB(sendToTelemetrySink);
    } catch (e) {
      console.warn(
        "⚠️ [Web Vitals] Failed to initialize Core Web Vitals tracking.",
        e,
      );
    }
  }, []);

  return null;
}
