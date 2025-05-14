import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type PlacesType = {
  name: string;
  address: string;
  location: { lat: number; lng: number };
  rating: number;
  open_now: boolean;
  description: string;
};
type ResType = { results: PlacesType[] };

interface MapProps {
  setUserLocation: (lng: number, lat: number) => void;
  renderMarker: boolean;
  places: ResType | undefined;
}

export default function Map({
  setUserLocation,
  renderMarker,
  places,
}: MapProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || mapRef.current || !containerRef.current) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_GL_ACCESS_TOKEN;
    if (!token) {
      setError("Map token missing");
      return;
    }
    mapboxgl.accessToken = token;
    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-71.41, 41.82],
      zoom: 12,
    });
    mapRef.current!.on("load", () => {
      const center = mapRef.current!.getCenter();
      setUserLocation(center.lng, center.lat);
    });
    setUserLocation(
      mapRef.current.getCenter().lng,
      mapRef.current.getCenter().lat
    );

    mapRef.current.on("error", () => setError("Map error"));
  }, [isClient, setUserLocation]);

  useEffect(() => {
    if (!renderMarker || !mapRef.current || !places?.results) return;
    mapRef.current
      .getCanvasContainer()
      .querySelectorAll<HTMLElement>(".marker")
      .forEach((m) => m.remove());
    places.results.forEach((p, i) => {
      new mapboxgl.Marker({ color: i < 3 ? "#FB7021" : "#888" })
        .setLngLat([p.location.lng, p.location.lat])
        .addTo(mapRef.current!);
    });
  }, [renderMarker, places]);

  if (!isClient) {
    return (
      <div
        id="map"
        style={{ height: "100%" }}
        role="application"
        aria-label="Map showing places"
      />
    );
  }

  if (error) {
    return (
      <div
        id="map"
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0f0f0",
        }}
      >
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  return (
    <div
      id="map"
      ref={containerRef}
      style={{ height: "100%" }}
      role="application"
      aria-label="Map showing places"
    />
  );
}
