import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Charger } from "@/data/chargers";
import { Link } from "@tanstack/react-router";

const iconFor = (c: Charger) => {
  const color =
    c.source === "public" ? "#22C55E" : c.source === "community" ? "#0EA5E9" : "#F59E0B";
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:grid;place-items:center;box-shadow:0 4px 10px rgba(0,0,0,0.25);border:2px solid white"><div style="transform:rotate(45deg);color:white;font-weight:700;font-size:14px">⚡</div></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  });
};

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, Math.max(map.getZoom(), 13));
  }, [center, map]);
  return null;
}

interface Props {
  chargers: Charger[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

export function ChargerMap({ chargers, center = [10.5, 76.5], zoom = 8, height = "100%", selectedId, onSelect }: Props) {
  const selected = chargers.find((c) => c.id === selectedId);
  const activeCenter: [number, number] = selected ? [selected.lat, selected.lng] : center;
  return (
    <div style={{ height, width: "100%" }} className="overflow-hidden rounded-2xl border border-border">
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {selected && <Recenter center={activeCenter} />}
        {chargers.map((c) => (
          <Marker
            key={c.id}
            position={[c.lat, c.lng]}
            icon={iconFor(c)}
            eventHandlers={onSelect ? { click: () => onSelect(c.id) } : undefined}
          >
            <Popup>
              <div style={{ minWidth: 220 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: "#666" }}>{c.address}</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>{c.chargerType} · {c.powerKw} kW</div>
                <div style={{ fontSize: 12 }}>
                  {c.available ? <span style={{ color: "#22C55E", fontWeight: 600 }}>Available</span> : <span style={{ color: "#F97316", fontWeight: 600 }}>Busy</span>}
                  {" · ★ "}{c.rating}
                </div>
                <div style={{ display: "flex", gap: 6, paddingTop: 6 }}>
                  {onSelect ? (
                    <button onClick={() => onSelect(c.id)} style={{ background: "#22C55E", color: "white", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer" }}>
                      Open details
                    </button>
                  ) : (
                    <Link to="/charger/$id" params={{ id: c.id }} style={{ background: "#22C55E", color: "white", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                      Open details
                    </Link>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}