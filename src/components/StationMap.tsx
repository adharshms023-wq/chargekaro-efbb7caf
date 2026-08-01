import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { navigationLink, type Station } from "@/data/stations";

const icon = (s: Station) => {
  const color = s.chargingType?.includes("DC") ? "#00E676" : "#2979FF";
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:grid;place-items:center;box-shadow:0 4px 10px rgba(0,0,0,.25);border:2px solid white"><div style="transform:rotate(45deg);color:white;font-weight:700;font-size:12px">⚡</div></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -24],
  });
};

interface Props {
  stations: Station[];
  height?: string;
  onSelect?: (id: string) => void;
}

export function StationMap({ stations, height = "100%", onSelect }: Props) {
  return (
    <div style={{ height, width: "100%" }} className="overflow-hidden rounded-2xl border border-border">
      <MapContainer center={[10.4, 76.3]} zoom={7} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {stations.map((s) => (
          <Marker
            key={s.id}
            position={[s.lat, s.lng]}
            icon={icon(s)}
            eventHandlers={onSelect ? { click: () => onSelect(s.id) } : undefined}
          >
            <Popup>
              <div style={{ minWidth: 210 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                {s.provider && <div style={{ fontSize: 12, color: "#666" }}>{s.provider}</div>}
                <div style={{ fontSize: 12, color: "#666" }}>{s.address}</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  {[s.chargingType, s.maxPowerKw ? `${s.maxPowerKw} kW` : null, s.connectors.join(", ") || null]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
                <a
                  href={navigationLink(s)}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "inline-block", marginTop: 6, background: "#00E676", color: "#0D1117", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, textDecoration: "none" }}
                >
                  Navigate
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}