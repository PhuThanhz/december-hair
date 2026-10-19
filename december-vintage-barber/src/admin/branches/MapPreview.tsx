"use client";

import { useEffect, useRef } from "react";
import type { Map as MLMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useAdminT } from "../Providers";
import { Button } from "../ui";

// The same free tiles as the site's own map
const STYLE = "https://tiles.openfreemap.org/styles/positron";

export type Camera = { bearing: number; zoom: number; pitch: number };

const round = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d;

/**
 * Where the salon is and how the site's close-up looks at it. Drag the pin onto the entrance;
 * turn (right-drag or two fingers) and tilt the map, then take its view as the camera.
 */
export default function MapPreview({
  lat,
  lng,
  camera,
  onMove,
  onCamera,
}: {
  lat: number;
  lng: number;
  camera: Camera;
  onMove: (p: { lat: number; lng: number }) => void;
  onCamera: (c: Camera) => void;
}) {
  const { t } = useAdminT();
  const box = useRef<HTMLDivElement | null>(null);
  const map = useRef<MLMap | null>(null);
  const marker = useRef<Marker | null>(null);
  const moved = useRef(onMove);
  useEffect(() => {
    moved.current = onMove;
  }, [onMove]);
  // The first values, for creating the map once
  const start = useRef({ lat, lng, camera });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const maplibregl = await import("maplibre-gl");
      if (cancelled || !box.current) return;
      maplibregl.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
      const { lat: la, lng: ln, camera: c } = start.current;
      const m = new maplibregl.Map({
        container: box.current,
        style: STYLE,
        center: [ln, la],
        zoom: c.zoom,
        pitch: c.pitch,
        bearing: c.bearing,
        attributionControl: { compact: true },
      });
      m.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
      const mk = new maplibregl.Marker({ draggable: true, color: "#3f6b2c" }).setLngLat([ln, la]).addTo(m);
      mk.on("dragend", () => {
        const p = mk.getLngLat();
        moved.current({ lat: round(p.lat, 6), lng: round(p.lng, 6) });
      });
      map.current = m;
      marker.current = mk;
    })();
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Typed coordinates or camera values move the preview too
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    marker.current?.setLngLat([lng, lat]);
    m.jumpTo({ center: [lng, lat], zoom: camera.zoom, pitch: camera.pitch, bearing: camera.bearing });
  }, [lat, lng, camera.zoom, camera.pitch, camera.bearing]);

  const takeView = () => {
    const m = map.current;
    if (!m) return;
    onCamera({ bearing: round(m.getBearing(), 1), zoom: round(m.getZoom(), 1), pitch: round(m.getPitch(), 1) });
  };

  return (
    <div className="space-y-2">
      {/* MapLibre forces position: relative on its container, so it is sized from a wrapper */}
      <div className="relative h-80 overflow-hidden rounded-2xl border border-ink/10 bg-celadon">
        <div className="absolute inset-0">
          <div ref={box} className="h-full w-full" />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-ink-soft max-w-md">{t.cms.branches.mapHelp}</p>
        <Button type="button" variant="secondary" onClick={takeView}>
          {t.cms.branches.useCamera}
        </Button>
      </div>
    </div>
  );
}
