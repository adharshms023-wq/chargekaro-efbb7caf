import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Station } from "@/data/stations";
import { StationClusterLayer } from "./StationClusterLayer";
import { useIsDark } from "@/hooks/use-theme";
import type { Coords } from "@/hooks/use-geolocation";

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

/** Shows the visitor's live position and centres on it when it first arrives. */
function UserLocationLayer({ coords }: { coords: Coords }) {
  const map = useMap();

  useEffect(() => {
    if (!Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) return;

    const icon = L.divIcon({
      className: "",
      html: `<div style="position:relative;width:22px;height:22px"><span style="position:absolute;inset:0;border-radius:50%;background:rgba(41,121,255,.25);animation:ck-pulse 2s ease-out infinite"></span><span style="position:absolute;left:5px;top:5px;width:12px;height:12px;border-radius:50%;background:#2979FF;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)"></span></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
    const marker = L.marker([coords.lat, coords.lng], { icon, zIndexOffset: 1000 })
      .bindPopup("You are here");
    marker.addTo(map);

    const circle = coords.accuracy
      ? L.circle([coords.lat, coords.lng], {
          radius: coords.accuracy,
          color: "#2979FF",
          weight: 1,
          fillColor: "#2979FF",
          fillOpacity: 0.08,
        }).addTo(map)
      : null;

    const id = window.setTimeout(() => {
      try {
        map.flyTo([coords.lat, coords.lng], Math.max(map.getZoom(), 12), { duration: 0.8 });
      } catch {
        /* map not ready — ignore */
      }
    }, 0);

    return () => {
      window.clearTimeout(id);
      map.removeLayer(marker);
      if (circle) map.removeLayer(circle);
    };
  }, [map, coords.lat, coords.lng, coords.accuracy]);

  return null;
}

interface Props {
  stations: Station[];
  height?: string;
  onSelect?: (id: string) => void;
  fitBounds?: boolean;
  userLocation?: Coords | null;
}

export function StationMap({ stations, height = "100%", onSelect, fitBounds = true, userLocation }: Props) {
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
        {fitBounds && !userLocation && <FitToStations stations={stations} />}
        {userLocation && <UserLocationLayer coords={userLocation} />}
        <StationClusterLayer stations={stations} onSelect={onSelect} />
      </MapContainer>

      {/* subtle vignette so the basemap blends into the app surface */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-foreground/10" />

      {/* legend */}
      <div className="glass pointer-events-none absolute left-3 top-3 z-[400] flex flex-col gap-1 rounded-xl border border-border/60 px-3 py-2 text-[10px] font-semibold">
        <span className="flex items-center gap-1.5">
          <i className="h-2.5 w-2.5 rounded-full" style={{ background: "#00E676" }} /> DC fast station
        </span>
        <span className="flex items-center gap-1.5">
          <i className="h-2.5 w-2.5 rounded-full" style={{ background: "#2979FF" }} /> AC / standard
        </span>
        <span className="flex items-center gap-1.5">
          <i className="h-2.5 w-2.5 rounded-full" style={{ background: "#FF6E40" }} /> Community listing
        </span>
        {userLocation && (
          <span className="flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full" style={{ background: "#2979FF" }} /> You
          </span>
        )}
      </div>
    </div>
  );
}
