"use client";

import { useEffect, useRef, useState } from "react";

export function GoogleMap({
  address,
  name,
}: {
  address: string;
  name: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const initialized = useRef(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || !mapRef.current || initialized.current) return;
    initialized.current = true;

    async function initMap() {
      try {
        const { setOptions, importLibrary } = await import("@googlemaps/js-api-loader");
        setOptions({ key: apiKey! });

        const { Geocoder } = await importLibrary("geocoding") as google.maps.GeocodingLibrary;
        const { Map } = await importLibrary("maps") as google.maps.MapsLibrary;
        const { Marker } = await importLibrary("marker") as google.maps.MarkerLibrary;

        const geocoder = new Geocoder();
        const results = await geocoder.geocode({ address });

        if (results.results[0] && mapRef.current) {
          const location = results.results[0].geometry.location;
          const map = new Map(mapRef.current, {
            center: location,
            zoom: 15,
            disableDefaultUI: true,
            zoomControl: true,
          });

          new Marker({
            map,
            position: location,
            title: name,
          });
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      }
    }

    initMap();
  }, [address, name, apiKey]);

  if (!apiKey) return null;
  if (error) return null;

  return (
    <div
      ref={mapRef}
      className="w-full h-48 rounded-[var(--radius-md)] mt-3 border border-[var(--color-border)]"
    />
  );
}
