"use client";

import { useEffect, useRef, useState } from "react";
import type { GeoJSONSource, Map as MLMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Branch } from "@/content/types";
import { useContent } from "@/content/ContentProvider";
import { findBranch } from "@/content/helpers";

// Free vector tiles, no API key. Recoloured below to the site's green & white.
const STYLE = "https://tiles.openfreemap.org/styles/positron";

// Official Czech aerial photos (ČÚZK open data, ~20 cm/px), Web Mercator tiles, no API key
const ORTHO = "https://ags.cuzk.gov.cz/arcgis1/rest/services/ORTOFOTO_WM/MapServer/tile/{z}/{y}/{x}";

/** The overview frames every salon, with a margin around the outermost ones */
function overview(branches: Branch[]): [[number, number], [number, number]] {
  if (!branches.length) return [[12.09, 48.55], [18.86, 51.06]]; // all of Czechia
  const lng = branches.map((b) => b.coords[0]);
  const lat = branches.map((b) => b.coords[1]);
  return [
    [Math.min(...lng) - 0.15, Math.min(...lat) - 0.09],
    [Math.max(...lng) + 0.15, Math.max(...lat) + 0.09],
  ];
}

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
      {
        id: "ortho",
        type: "raster",
        source: "ortho",
        layout: { visibility: "none" },
        // No opacity transition: the hidden preload must start invisible, not fade out from 1 (a flash)
        paint: { "raster-fade-duration": 300, "raster-opacity": 0, "raster-opacity-transition": { duration: 0, delay: 0 } },
      },
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
        "fill-extrusion-color": "#dcdbcf",
        "fill-extrusion-height": ["coalesce", ["get", "render_height"], 8],
        "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
        "fill-extrusion-opacity": 1,
      },
    });
  }

  // The salon's own centre in brand green, with a soft glow on the ground around it
  if (!map.getSource("salon-point")) {
    const empty = { type: "FeatureCollection" as const, features: [] };
    map.addSource("salon", { type: "geojson", data: empty });
    map.addSource("salon-point", { type: "geojson", data: empty });
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
    map.addLayer({
      id: "salon-building",
      type: "fill-extrusion",
      source: "salon",
      paint: {
        "fill-extrusion-color": "#4a7a36",
        "fill-extrusion-height": ["+", ["coalesce", ["get", "render_height"], 8], 1],
        "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
        "fill-extrusion-opacity": 1,
      },
    });
  }
}

type Ring = [number, number][];
/** Grow a ring slightly around its centre (~1 m on a shopping centre) so the green copy fully
 *  encloses the grey building: no shared walls, so no z-fighting stripes. */
const grow = (ring: Ring, k = 1.004): Ring => {
  const cx = ring.reduce((a, p) => a + p[0], 0) / ring.length;
  const cy = ring.reduce((a, p) => a + p[1], 0) / ring.length;
  return ring.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]);
};

/** Light up the building under the salon's pin (and the ground around it); null clears it. */
function highlight(map: MLMap, coords: [number, number] | null): boolean {
  const point = map.getSource("salon-point") as GeoJSONSource | undefined;
  const building = map.getSource("salon") as GeoJSONSource | undefined;
  if (!point || !building) return false;
  if (!coords) {
    point.setData({ type: "FeatureCollection", features: [] });
    building.setData({ type: "FeatureCollection", features: [] });
    return false;
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
  // Only the building(s) right under the pin. Plain copies: rendered features are live tile objects
  // the GeoJSON worker can't receive. (Ids aren't unique in these tiles, so feature-state can't be used.)
  // Tiles bundle unrelated buildings into one multi-part feature, so keep only the parts whose
  // outline actually reaches the pin
  const near = (ring: Ring) => {
    const pts = ring.map((c) => map.project(c));
    const xs = pts.map((q) => q.x);
    const ys = pts.map((q) => q.y);
    return Math.min(...xs) <= at.x + 6 && Math.max(...xs) >= at.x - 6 && Math.min(...ys) <= at.y + 6 && Math.max(...ys) >= at.y - 6;
  };
  const polygons: Ring[][] = [];
  for (const f of parts) {
    const g = f.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;
    const polys = (g.type === "Polygon" ? [g.coordinates] : g.coordinates) as Ring[][];
    for (const poly of polys) if (near(poly[0])) polygons.push(poly.map((r) => grow(r)));
  }
  building.setData({
    type: "Feature",
    geometry: { type: "MultiPolygon", coordinates: polygons },
    properties: { ...(parts[0]?.properties ?? {}) },
  });
  return polygons.length > 0;
}

/** Swap between the drawn map and the aerial photo; labels flip to white so they stay legible. */
function setAerial(map: MLMap, on: boolean) {
  if (!map.getLayer("ortho")) return;
  // Opacity first, then visibility, so the layer never shows a frame at the old opacity
  map.setPaintProperty("ortho", "raster-opacity", on ? 1 : 0);
  map.setLayoutProperty("ortho", "visibility", on ? "visible" : "none");
  map.setLayoutProperty("building-3d", "visibility", on ? "none" : "visible");
  map.setLayoutProperty("salon-building", "visibility", on ? "none" : "visible");
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

/** Load the aerial photo for the current view without showing it, so the later sweep never waits. */
function preloadAerial(map: MLMap) {
  if (!map.getLayer("ortho")) return;
  map.setPaintProperty("ortho", "raster-opacity", 0);
  map.setLayoutProperty("ortho", "visibility", "visible");
}

/** Seconds on the drawn map before the sweep reveals the aerial photo, and the sweep itself (ms). */
const MAP_FIRST = 4000;
const SWEEP = 1700;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** The brand's "D" in a green disc; the salon name is its accessible label. */
function markerEl(label: string) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "dh-marker";
  el.setAttribute("aria-label", label);
  el.innerHTML = `<span class="dh-marker-pulse"></span><span class="dh-marker-dot"><img src="/images/logo-d-white.png" alt="" /></span>`;
  return el;
}

export default function BranchMap({
  active,
  onSelect,
  hover = null,
  onHover,
  labels,
}: {
  active: string | null;
  onSelect: (id: string) => void;
  /** The salon whose card (or pin) is under the pointer: its pin lights up */
  hover?: string | null;
  onHover?: (id: string | null) => void;
  labels: { map: string; aerial: string; aria: string };
}) {
  const { branches } = useContent();
  // Read inside the map's own effects, which run once
  const branchList = useRef(branches);
  const box = useRef<HTMLDivElement | null>(null);
  const map = useRef<MLMap | null>(null);
  const markers = useRef<Record<string, Marker>>({});
  const [failed, setFailed] = useState(false);
  const [aerial, setAerialState] = useState(false);
  const aerialRef = useRef(false);
  // Drone-style orbit around the selected salon
  const orbit = useRef(0);
  const onScreen = useRef(true);
  // The map → aerial sweep: pending timer, running frame, the frozen map shot and the divider line
  const sweepTimer = useRef(0);
  const sweepFrame = useRef(0);
  const sweeping = useRef(false);
  const sweepEls = useRef<HTMLElement[]>([]);
  // Bumped on every new pick and every cancelled sweep, so stale callbacks know to stand down
  const flight = useRef(0);
  const sweepRun = useRef(0);
  // The aerial view was switched on by the sweep (not by the visitor), so it goes back with the salon
  const autoAerial = useRef(false);
  const clearSweep = () => {
    window.clearTimeout(sweepTimer.current);
    cancelAnimationFrame(sweepFrame.current);
    sweepRun.current++;
    sweepTimer.current = 0;
    sweeping.current = false;
    sweepEls.current.forEach((e) => e.remove());
    sweepEls.current = [];
  };
  const stopOrbit = () => {
    cancelAnimationFrame(orbit.current);
    orbit.current = 0;
    // A hand on the map also calls off a sweep that hasn't started
    window.clearTimeout(sweepTimer.current);
  };

  /**
   * Freeze the drawn map as a picture on top, switch the real map underneath to the aerial photo
   * (already loaded), then cut the picture away left to right behind a light line: for a moment
   * it's half map, half photo. The orbit holds still meanwhile so both halves line up.
   */
  const sweep = (m: MLMap) => {
    if (aerialRef.current) return;
    sweeping.current = true;
    const run = sweepRun.current;
    m.once("render", () => {
      // Called off (new salon, unmount) before this frame was drawn
      if (run !== sweepRun.current) return;
      // Still inside the frame that drew it, so the WebGL buffer can be copied
      const src = m.getCanvas();
      const shot = document.createElement("canvas");
      shot.width = src.width;
      shot.height = src.height;
      shot.getContext("2d")?.drawImage(src, 0, 0);
      shot.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
      const line = document.createElement("div");
      line.style.cssText =
        "position:absolute;top:0;bottom:0;left:0;width:2px;margin-left:-1px;background:#f4f3ee;box-shadow:0 0 22px 3px rgba(15,26,18,.35);pointer-events:none;opacity:0";
      // Right after the canvas: above the map, still under the pins
      src.after(shot, line);
      sweepEls.current = [shot, line];

      autoAerial.current = true;
      aerialRef.current = true;
      setAerial(m, true);
      setAerialState(true);

      let started = false;
      const go = () => {
        if (started || run !== sweepRun.current) return;
        started = true;
        const t0 = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - t0) / SWEEP);
          const x = easeInOut(p) * 100;
          shot.style.clipPath = `inset(0 0 0 ${x}%)`;
          line.style.left = `${x}%`;
          line.style.opacity = String(Math.min(1, Math.min(p, 1 - p) * 12));
          if (p < 1) sweepFrame.current = requestAnimationFrame(step);
          else clearSweep();
        };
        sweepFrame.current = requestAnimationFrame(step);
      };
      // The photo is preloaded, so this is one frame; the timeout only guards a slow tile
      m.once("idle", go);
      window.setTimeout(go, 1200);
    });
    m.triggerRepaint();
  };
  const select = useRef(onSelect);
  const hovered = useRef(onHover);
  useEffect(() => {
    select.current = onSelect;
    hovered.current = onHover;
  }, [onSelect, onHover]);

  // Card under the pointer → its pin lights up and pulses
  useEffect(() => {
    Object.entries(markers.current).forEach(([id, mk]) => mk.getElement().classList.toggle("is-hover", id === hover));
  }, [hover]);

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
        bounds: overview(branchList.current),
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

      branchList.current.forEach((b) => {
        const el = markerEl(b.mall);
        el.addEventListener("click", () => select.current(b.id));
        // Pin under the pointer → its card lights up
        el.addEventListener("mouseenter", () => hovered.current?.(b.id));
        el.addEventListener("mouseleave", () => hovered.current?.(null));
        // Sub-pixel placement: during the slow orbit, whole-pixel rounding made the pin jitter by a pixel
        markers.current[b.id] = new maplibregl.Marker({ element: el, subpixelPositioning: true })
          .setLngLat(b.coords)
          .addTo(m);
      });
    })();

    return () => {
      cancelled = true;
      stopOrbit();
      clearSweep();
      map.current?.remove();
      map.current = null;
      markers.current = {};
    };
  }, []);

  useEffect(() => {
    aerialRef.current = aerial;
    // Not isStyleLoaded(): that is false while any tile is still loading, which skipped the switch
    if (map.current) setAerial(map.current, aerial);
  }, [aerial]);

  // Fly to the active branch, or back to the overview
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    Object.entries(markers.current).forEach(([id, mk]) =>
      mk.getElement().classList.toggle("is-active", id === active)
    );
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const b = findBranch(branchList.current, active);
    highlight(m, null);
    stopOrbit();
    clearSweep();
    // Each salon starts on the drawn map again, unless the visitor chose the photo themselves
    if (autoAerial.current) {
      autoAerial.current = false;
      aerialRef.current = false;
      setAerialState(false);
    }
    setAerial(m, aerialRef.current);
    if (b) {
      // A newer pick interrupts this flight and fires its "moveend" early: only the latest flight counts
      const trip = ++flight.current;
      m.once("moveend", () => {
        if (trip !== flight.current) return;
        if (reduce) {
          highlight(m, b.coords);
          return;
        }
        // Load the photo of this spot now, hidden, while the green block has the stage
        if (!aerialRef.current) preloadAerial(m);
        // The sweep's countdown starts only once the green block is actually standing
        const later = () => {
          if (trip !== flight.current || aerialRef.current) return;
          if (!onScreen.current || document.hidden) sweepTimer.current = window.setTimeout(later, 1000);
          else sweep(m);
        };
        const standing = () => {
          if (trip !== flight.current) return;
          sweepTimer.current = window.setTimeout(later, MAP_FIRST);
        };
        // Building tiles may still be arriving: try now, else once they have all landed
        if (highlight(m, b.coords)) standing();
        else
          m.once("idle", () => {
            if (trip !== flight.current) return;
            highlight(m, b.coords);
            standing();
          });
        // Then circle the centre slowly, about one turn every 90 s, until someone touches the map
        let last = performance.now();
        const spin = (now: number) => {
          const dt = Math.min(now - last, 100);
          last = now;
          if (onScreen.current && !document.hidden && !sweeping.current) m.setBearing(m.getBearing() + dt * 0.004);
          orbit.current = requestAnimationFrame(spin);
        };
        orbit.current = requestAnimationFrame(spin);
      });
      m.flyTo({
        center: b.coords,
        zoom: b.map.zoom,
        pitch: b.map.pitch,
        bearing: b.map.bearing,
        duration: reduce ? 0 : 2600,
        curve: 1.6,
        essential: true,
      });
    } else {
      flight.current++;
      m.fitBounds(overview(branchList.current), { padding: 70, pitch: 0, bearing: 0, duration: reduce ? 0 : 1800 });
    }
  }, [active]);

  if (failed) {
    const b = findBranch(branches, active) ?? branches[0];
    if (!b) return null;
    return (
      <iframe
        key={b.id}
        title={`${labels.map} — ${b.mall}`}
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
      <div ref={box} className="w-full h-full" aria-label={labels.aria} />
      <div className="absolute right-4 top-4 z-10 flex rounded-full bg-paper/90 p-1 text-xs font-medium shadow-sm">
        {[false, true].map((on) => (
          <button
            key={String(on)}
            type="button"
            onClick={() => {
              // The visitor's own choice: no automatic sweep or switch-back after this
              window.clearTimeout(sweepTimer.current);
              autoAerial.current = false;
              setAerialState(on);
            }}
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
