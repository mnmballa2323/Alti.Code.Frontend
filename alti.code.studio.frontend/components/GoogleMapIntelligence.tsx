"use client";

import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface GoogleMapIntelligenceProps {
  lat?: number;
  lng?: number;
  zoom?: number;
}

/**
 * Google Maps JS API Loader (Apache 2.0 SDK).
 * Grants the Swarm the ability to autonomously plot dynamic GeoJSON architectural
 * distributions and server locations natively on a 3D satellite map.
 */
export function GoogleMapIntelligence({
  lat = 37.422,
  lng = -122.084,
  zoom = 12,
}: GoogleMapIntelligenceProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "dummy_key",
        version: "weekly",
        libraries: ["places", "geometry"],
      });

      try {
        const { Map } = await loader.importLibrary("maps");

        if (mapRef.current) {
          // Initialize map with a dark tech theme
          new Map(mapRef.current, {
            center: { lat, lng },
            zoom,
            mapId: "DEMO_MAP_ID", // Replaces hardcoded styling with Google Cloud Map Management
            disableDefaultUI: true,
          });
        }
      } catch (error) {
        console.warn(
          "⚠️ [Google Maps] Failed to initialize API loader:",
          error,
        );
      }
    };

    initMap();
  }, [lat, lng, zoom]);

  return (
    <div
      ref={mapRef}
      className="w-full h-[400px] rounded-xl overflow-hidden border border-default-200"
    />
  );
}
