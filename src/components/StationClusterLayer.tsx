import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { navigationLink, type Station } from "@/data/stations";

const escapeHtml = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const pinIcon = (s: Station) => {
  const color = s.chargingType?.includes("DC") ? "#00E676" : "#2979FF";
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:grid;place-items:center;box-shadow:0 4px 10px rgba(0,0,0,.25);border:2px solid white"><div style="transform:rotate(45deg);color:white;font-weight:700;font-size:12px">⚡</div></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -24],
  });
};

const clusterIcon = (cluster: L.MarkerCluster) => {
  const count = cluster.getChildCount();
  const size = count < 10 ? 36 : count < 50 ? 44 : 52;
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 30% 30%, rgba(0,230,118,.98), rgba(0,188,212,.92));border:3px solid rgba(255,255,255,.55);box-shadow:0 8px 22px rgba(0,230,118,.35);color:#0D1117;font-weight:800;font-size:${count > 99 ? 12 : 13}px">${count}</div>`,
    iconSize: [size, size],
  });
};

const popupHtml = (s: Station) => `
  <div style="min-width:216px">
    <div class="ck-pop-title">${escapeHtml(s.name)}</div>
    ${s.provider ? `<div class="ck-pop-sub">${escapeHtml(s.provider)}</div>` : ""}
    <div class="ck-pop-sub">${escapeHtml(s.address)}</div>
    <div class="ck-pop-meta">${escapeHtml(
      [s.chargingType, s.maxPowerKw ? `${s.maxPowerKw} kW` : null, s.connectors.join(" · ") || null]
        .filter(Boolean)
        .join("  •  ") || "Charging station",
    )}</div>
    <a class="ck-pop-btn" href="${navigationLink(s)}" target="_blank" rel="noreferrer">Navigate →</a>
  </div>`;

interface Props {
  stations: Station[];
  onSelect?: (id: string) => void;
}

export function StationClusterLayer({ stations, onSelect }: Props) {
  const map = useMap();
  const groupRef = useRef<L.MarkerClusterGroup | null>(null);
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;

  useEffect(() => {
    const group = L.markerClusterGroup({
      chunkedLoading: true,
      chunkInterval: 100,
      maxClusterRadius: 60,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 16,
      iconCreateFunction: clusterIcon,
    });
    groupRef.current = group;
    map.addLayer(group);
    return () => {
      map.removeLayer(group);
      groupRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    const markers = stations.map((s) => {
      const m = L.marker([s.lat, s.lng], { icon: pinIcon(s) });
      m.bindPopup(() => popupHtml(s));
      m.on("click", () => selectRef.current?.(s.id));
      return m;
    });
    group.clearLayers();
    group.addLayers(markers);
  }, [stations]);

  return null;
}
