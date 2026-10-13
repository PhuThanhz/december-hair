"use client";

import { useEffect, useRef, useState } from "react";
import type { GeoJSONSource, Map as MLMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { BRANCHES } from "@/app/data";

// Free vector tiles, no API key. Recoloured below to the site's green & white.
const STYLE = "https://tiles.openfreemap.org/styles/positron";

// Official Czech aerial photos (ČÚZK open data, ~20 cm/px), Web Mercator tiles, no API key
const ORTHO = "https://ags.cuzk.gov.cz/arcgis1/rest/services/ORTOFOTO_WM/MapServer/tile/{z}/{y}/{x}";

// Frames all three salons in the overview
const OVERVIEW: [[number, number], [number, number]] = [
  [13.98, 49.97],
  [15.05, 50.5],
];

const PALETTE = {
  land: "#f4f3ee",
  park: "#cfdec3",
  wood: "#c4d6b6",
  water: "#c9d8cf",
  building: "#e6e5dc",
  road: "#ffffff",
  roadMajor: "#ffffff",
  casing: "#dcdbd2",
  label: "#56604f",
  halo: "#f4f3ee",
};

function recolor(map: MLMap) {
  for (const layer of map.getStyle().layers ?? []) {
    const id = layer.id;
    try {
      if (layer.type === "background") map.setPaintProperty(id, "background-color", PALETTE.land);
      else if (id === "park") map.setPaintProperty(id, "fill-color", PALETTE.park);
      else if (id === "landcover_wood") map.setPaintProperty(id, "fill-color", PALETTE.wood);
      else if (id === "landuse_residential") map.setPaintProperty(id, "fill-opacity", 0);
      else if (id === "water") map.setPaintProperty(id, "fill-color", PALETTE.water);
      else if (id === "waterway") map.setPaintProperty(id, "line-color", PALETTE.water);
      else if (id === "building") map.setPaintProperty(id, "fill-color", PALETTE.building);
      else if (layer.type === "line" && id.includes("casing")) map.setPaintProperty(id, "line-color", PALETTE.casing);
      else if (layer.type === "line" && id.startsWith("highway")) map.setPaintProperty(id, "line-color", PALETTE.roadMajor);
      else if (layer.type === "line" && id.startsWith("boundary")) map.setPaintProperty(id, "line-color", "#b9c4b0");
      else if (layer.type === "symbol") {
        map.setPaintProperty(id, "text-color", PALETTE.label);
        map.setPaintProperty(id, "text-halo-color", PALETTE.halo);
      }
    } catch {
      // Some layers lack a given paint property; skip them.
    }
  }

  // Aerial photo sits under the labels, hidden until "Letecká" is picked
  if (!map.getSource("ortho")) {
    map.addSource("ortho", {
      type: "raster",
      tiles: [ORTHO],
      tileSize: 256,
      maxzoom: 20,
      attribution: '<a href="https://www.cuzk.gov.cz" target="_blank" rel="noopener">© ČÚZK</a>',
    });
    const firstLabel = map.getStyle().layers?.find((l) => l.type === "symbol")?.id;
    map.addLayer(
      { id: "ortho", type: "raster", source: "ortho", layout: { visibility: "none" }, paint: { "raster-fade-duration": 300 } },
      firstLabel
    );
  }

  // Soft 3D buildings for the tilted close-up
  if (!map.getLayer("building-3d")) {
    map.addLayer({
      id: "building-3d",
      type: "fill-extrusion",
      source: "openmaptiles",
      "source-layer": "building",
      minzoom: 14,
      paint: {
        // The salon's own centre turns brand green (set per building via feature-state, so it's the same
        // block recoloured rather than a second one on top, which flickered where the walls overlapped)
        "fill-extrusion-color": ["case", ["boolean", ["feature-state", "salon"], false], "#4a7a36", "#dcdbcf"],
        "fill-extrusion-height": ["coalesce", ["get", "render_height"], 8],
        "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
        "fill-extrusion-opacity": 1,
      },
    });
  }

  // A soft glow on the ground around the salon
  if (!map.getSource("salon-point")) {
    map.addSource("salon-point", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
    map.addLayer(
      {
        id: "salon-glow",
        type: "circle",
        source: "salon-point",
        paint: {
          "circle-color": "#3f6b2c",
          "circle-opacity": 0.16,
          "circle-blur": 0.6,
          "circle-pitch-alignment": "map",
          "circle-radius": ["interpolate", ["exponential", 2], ["zoom"], 12, 18, 17, 260],
        },
      },
      "building-3d"
    );
  }
}

const BUILDINGS = { source: "openmaptiles", sourceLayer: "building" } as const;

/** Light up the building under the salon's pin (and the ground around it); null clears it. */
function highlight(map: MLMap, coords: [number, number] | null) {
  const point = map.getSource("salon-point") as GeoJSONSource | undefined;
  if (!point) return;
  map.removeFeatureState(BUILDINGS);
  if (!coords) {
    point.setData({ type: "FeatureCollection", features: [] });
    return;
  }
  point.setData({ type: "Feature", geometry: { type: "Point", coordinates: coords }, properties: {} });
  const at = map.project(coords);
  // A large centre is split across tiles, so take every building part within a few pixels of the pin
  const parts = map.queryRenderedFeatures(
    [
      [at.x - 6, at.y - 6],
      [at.x + 6, at.y + 6],
    ],
    { layers: ["building-3d"] }
  );
  for (const f of parts) if (f.id !== undefined) map.setFeatureState({ ...BUILDINGS, id: f.id }, { salon: true });
}

/** Swap between the drawn map and the aerial photo; labels flip to white so they stay legible. */
function setAerial(map: MLMap, on: boolean) {
  if (!map.getLayer("ortho")) return;
  map.setLayoutProperty("ortho", "visibility", on ? "visible" : "none");
  map.setLayoutProperty("building-3d", "visibility", on ? "none" : "visible");
  for (const layer of map.getStyle().layers ?? []) {
    if (layer.type !== "symbol") continue;
    // Road-number shields are white plates: white text would vanish, so they step aside on the photo
    if (layer.id.includes("shield")) {
      map.setLayoutProperty(layer.id, "visibility", on ? "none" : "visible");
      continue;
    }
    try {
      map.setPaintProperty(layer.id, "text-color", on ? "#ffffff" : PALETTE.label);
      map.setPaintProperty(layer.id, "text-halo-color", on ? "rgba(15,26,18,0.75)" : PALETTE.halo);
    } catch {
      // Icon-only layers have no text paint
    }
  }
}

function markerEl(index: number) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "dh-marker";
  el.innerHTML = `<span class="dh-marker-pulse"></span><span class="dh-marker-dot">0${index + 1}</span>`;
  return el;
}

export default function BranchMap({
  active,
  onSelect,
  labels,
}: {
  active: string | null;
  onSelect: (id: string) => void;
  labels: { map: string; aerial: string };
}) {
  const box = useRef<HTMLDivElement | null>(null);
  const map = useRef<MLMap | null>(null);
  const markers = useRef<Record<string, Marker>>({});
  const [failed, setFailed] = useState(false);
  const [aerial, setAerialState] = useState(false);
  const aerialRef = useRef(false);
  // Drone-style orbit around the selected salon
  const orbit = useRef(0);
  const onScreen = useRef(true);
  const stopOrbit = () => {
    cancelAnimationFrame(orbit.current);
    orbit.current = 0;
  };
  const select = useRef(onSelect);
  useEffect(() => {
    select.current = onSelect;
  }, [onSelect]);

  // Create the map once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // No WebGL (hardware acceleration off, blocked GPU…) → use the embedded fallback
      const probe = document.createElement("canvas");
      if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) {
        setFailed(true);
        return;
      }
      const maplibregl = await import("maplibre-gl");
      if (cancelled || !box.current) return;
      // The bundler can't resolve MapLibre's worker, so serve a copy from /public
      // (copied from node_modules/maplibre-gl/dist — refresh it when upgrading maplibre-gl)
      maplibregl.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
      const touch = window.matchMedia("(pointer: coarse)").matches;

      let m: MLMap;
      try {
        m = new maplibregl.Map({
        container: box.current,
        style: STYLE,
        bounds: OVERVIEW,
        fitBoundsOptions: { padding: 70 },
        attributionControl: { compact: true },
        cooperativeGestures: touch,
        pitchWithRotate: true,
        // Drawing 3D buildings at full Retina density is the costliest part of the orbit; 1.5x looks the same
        pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
        });
      } catch {
        setFailed(true);
        return;
      }
      // Tiles blocked or too slow: fall back rather than leave an empty box
      // Only the first load counts (m.loaded() is also false whenever later tiles stream in),
      // and only while the tab is visible: background tabs pause rendering, so "load" waits.
      let timeout = 0;
      const arm = () => {
        if (document.hidden || timeout) return;
        timeout = window.setTimeout(() => setFailed(true), 10000);
      };
      arm();
      document.addEventListener("visibilitychange", arm);
      m.once("load", () => {
        window.clearTimeout(timeout);
        document.removeEventListener("visibilitychange", arm);
      });
      m.scrollZoom.disable();
      m.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");
      map.current = m;

      m.on("style.load", () => {
        recolor(m);
        setAerial(m, aerialRef.current);
      });

      // Any hand on the map takes over from the drone
      for (const ev of ["mousedown", "touchstart", "wheel"] as const) m.on(ev, stopOrbit);
      // Only orbit while the map is on screen
      const io = new IntersectionObserver(([e]) => (onScreen.current = e.isIntersecting));
      if (box.current) io.observe(box.current);
      m.once("remove", () => io.disconnect());

      BRANCHES.forEach((b, i) => {
        const el = markerEl(i);
        el.addEventListener("click", () => select.current(b.id));
        markers.current[b.id] = new maplibregl.Marker({ element: el }).setLngLat(b.coords).addTo(m);
      });
    })();

    return () => {
      cancelled = true;
      stopOrbit();
      map.current?.remove();
      map.current = null;
      markers.current = {};
    };
  }, []);

  useEffect(() => {
    aerialRef.current = aerial;
    if (map.current?.isStyleLoaded()) setAerial(map.current, aerial);
  }, [aerial]);

  // Fly to the active branch, or back to the overview
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    Object.entries(markers.current).forEach(([id, mk]) =>
      mk.getElement().classList.toggle("is-active", id === active)
    );
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const b = BRANCHES.find((x) => x.id === active);
    highlight(m, null);
    stopOrbit();
    if (b) {
      m.once("moveend", () => {
        highlight(m, b.coords);
        if (reduce) return;
        // Then circle the centre slowly, about one turn every 90 s, until someone touches the map
        let last = performance.now();
        const spin = (now: number) => {
          const dt = Math.min(now - last, 100);
          last = now;
          if (onScreen.current && !document.hidden) m.setBearing(m.getBearing() + dt * 0.004);
          orbit.current = requestAnimationFrame(spin);
        };
        orbit.current = requestAnimationFrame(spin);
      });
      m.flyTo({
        center: b.coords,
        zoom: 16.2,
        pitch: 58,
        bearing: [-28, 20, -12][BRANCHES.indexOf(b)],
        duration: reduce ? 0 : 2600,
        curve: 1.6,
        essential: true,
      });
    } else {
      m.fitBounds(OVERVIEW, { padding: 70, pitch: 0, bearing: 0, duration: reduce ? 0 : 1800 });
    }
  }, [active]);

  if (failed) {
    const b = BRANCHES.find((x) => x.id === active) ?? BRANCHES[0];
    return (
      <iframe
        key={b.id}
        title={`Mapa — ${b.mall}`}
        src={`https://www.google.com/maps?q=${b.coords[1]},${b.coords[0]}&z=15&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        // Tint Google's map toward the site's green & white
        className="absolute inset-0 w-full h-full border-0 [filter:grayscale(1)_sepia(0.25)_hue-rotate(40deg)_saturate(1.1)_contrast(0.95)_brightness(1.03)]"
      />
    );
  }

  // MapLibre forces position: relative on its container, so size it from a wrapper
  return (
    <div className="absolute inset-0">
      <div ref={box} className="w-full h-full" aria-label="Mapa poboček" />
      <div className="absolute right-4 top-4 z-10 flex rounded-full bg-paper/90 p-1 text-xs font-medium shadow-sm">
        {[false, true].map((on) => (
          <button
            key={String(on)}
            type="button"
            onClick={() => setAerialState(on)}
            aria-pressed={aerial === on}
            className={`cursor-pointer rounded-full px-3.5 py-1.5 transition-colors ${
              aerial === on ? "bg-forest text-paper" : "text-ink-soft hover:text-ink"
            }`}
          >
            {on ? labels.aerial : labels.map}
          </button>
        ))}
      </div>
    </div>
  );
}
