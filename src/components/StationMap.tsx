import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Station } from "@/data/stations";
import { StationClusterLayer } from "./StationClusterLayer";
import { useIsDark } from "@/hooks/use-theme";

const TILES = {
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  light: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
} as const;

/** Smoothly fits the view to the currently filtered stations. */
function FitToStations({ stations }: { stations: Station[] }) {
  const map = useMap();
  const key = useMemo(
    () => stations.map((s) => s.id).join(",").slice(0, 2000) + stations.length,
    [stations],
  );

  useEffect(() => {
    const pts = stations
      .filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng))
      .map((s) => [s.lat, s.lng] as [number, number]);
    if (!pts.length) return;

    const bounds = L.latLngBounds(pts);
    if (!bounds.isValid()) return;

    const id = window.setTimeout(() => {
      const size = map.getSize();
      if (!size.x || !size.y) return;
      try {
        map.invalidateSize();
        map.flyToBounds(bounds, { padding: [48, 48], maxZoom: 13, duration: 0.6 });
      } catch {
        /* map not ready yet — ignore */
      }
    }, 0);

    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);

  return null;
}

interface Props {
  stations: Station[];
  height?: string;
  onSelect?: (id: string) => void;
  fitBounds?: boolean;
}

export function StationMap({ stations, height = "100%", onSelect, fitBounds = true }: Props) {
  const isDark = useIsDark();
  const tiles = isDark ? TILES.dark : TILES.light;

  return (
    <div
      style={{ height, width: "100%" }}
      className="relative overflow-hidden rounded-3xl border border-border/60 shadow-2xl shadow-primary/5"
    >
      <MapContainer
        center={[10.4, 76.3]}
        zoom={7}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
        zoomControl={false}
        preferCanvas
      >
        <TileLayer key={isDark ? "dark" : "light"} attribution={tiles.attribution} url={tiles.url} />
        <ZoomControl position="bottomright" />
        {fitBounds && <FitToStations stations={stations} />}
        <StationClusterLayer stations={stations} onSelect={onSelect} />
      </MapContainer>

      {/* subtle vignette so the basemap blends into the app surface */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-foreground/10" />
    </div>
  );
}
