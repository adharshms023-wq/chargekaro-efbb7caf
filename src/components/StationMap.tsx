import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Station } from "@/data/stations";
import { StationClusterLayer } from "./StationClusterLayer";

interface Props {
  stations: Station[];
  height?: string;
  onSelect?: (id: string) => void;
}

export function StationMap({ stations, height = "100%", onSelect }: Props) {
  return (
    <div style={{ height, width: "100%" }} className="overflow-hidden rounded-2xl border border-border">
      <MapContainer
        center={[10.4, 76.3]}
        zoom={7}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
        preferCanvas
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <StationClusterLayer stations={stations} onSelect={onSelect} />
      </MapContainer>
    </div>
  );
}
