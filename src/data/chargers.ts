export type ChargerSource = "public" | "community" | "place";
export type ChargerSpeed = "fast" | "slow";
export type ConnectorType = "CCS2" | "Type 2" | "CHAdeMO" | "Bharat AC" | "Bharat DC";
export type ChargerStatus = "available" | "busy" | "offline";
export type Facility = "Restroom" | "Cafe" | "Wi-Fi" | "Parking" | "Shopping" | "Restaurant" | "Lounge";
export type PayhipMode = "fixed" | "pwyw";

export interface Charger {
  id: string;
  ownerId?: string | null;
  name: string;
  ownerName?: string;
  phone?: string;
  source: ChargerSource;
  placeCategory?: "Cafe" | "Hotel" | "Resort" | "Mall" | "Restaurant";
  address: string;
  city: string;
  lat: number;
  lng: number;
  chargerType: string;
  connectors: ConnectorType[];
  speed: ChargerSpeed;
  powerKw: number;
  available: boolean;
  rating: number;
  hours: string;
  pricePerKwh: number;
  description: string;
  image: string;
  reviews?: { author: string; rating: number; comment: string }[];
  ports?: number;
  reviewCount?: number;
  facilities?: Facility[];
  rules?: string[];
  status?: ChargerStatus;
  featured?: boolean;
  payhipUrl?: string | null;
  payhipMode?: PayhipMode | null;
}

// Fallback location (Kochi) used when the user hasn't shared theirs.
export const USER_LOCATION: [number, number] = [9.9989, 76.2986];

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1633352615955-f0c99e0c8e5c?auto=format&fit=crop&w=1200&q=70";

export function mapDbCharger(row: {
  id: string;
  owner_id: string | null;
  name: string;
  address: string;
  city: string | null;
  lat: number | string;
  lng: number | string;
  source: ChargerSource;
  power_kw: number | string;
  speed: ChargerSpeed;
  connectors: string[] | null;
  price_per_kwh: number | string;
  hours: string;
  description: string | null;
  image: string | null;
  phone: string | null;
  owner_name: string | null;
  facilities: string[] | null;
  rules: string | null;
  payhip_product_url: string | null;
  payhip_mode: PayhipMode | null;
}): Charger {
  const powerKw = Number(row.power_kw) || 0;
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    address: row.address,
    city: row.city ?? "",
    lat: Number(row.lat),
    lng: Number(row.lng),
    source: row.source,
    powerKw,
    speed: row.speed,
    connectors: (row.connectors ?? []) as ConnectorType[],
    pricePerKwh: Number(row.price_per_kwh) || 0,
    hours: row.hours,
    description: row.description ?? "",
    image: row.image || DEFAULT_IMAGE,
    phone: row.phone ?? undefined,
    ownerName: row.owner_name ?? undefined,
    facilities: (row.facilities ?? []) as Facility[],
    rules: row.rules ? row.rules.split("\n").map((r) => r.trim()).filter(Boolean) : undefined,
    chargerType: row.speed === "fast" ? "DC Fast" : "AC Wallbox",
    available: true,
    rating: 5,
    ports: 1,
    reviewCount: 0,
    payhipUrl: row.payhip_product_url,
    payhipMode: row.payhip_mode,
  };
}

export function haversineKm(a: [number, number], b: [number, number]) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function chargerStatus(c: Charger): ChargerStatus {
  if (c.status) return c.status;
  return c.available ? "available" : "busy";
}

export function defaultPorts(c: Charger): number {
  return c.ports ?? (c.source === "community" ? 1 : c.speed === "fast" ? 4 : 2);
}

export function defaultFacilities(c: Charger): Facility[] {
  if (c.facilities && c.facilities.length > 0) return c.facilities;
  if (c.source === "place") return ["Restaurant", "Wi-Fi", "Parking"];
  if (c.source === "public") return ["Parking", "Restroom"];
  return ["Parking"];
}

export function estimatedChargeMins(c: Charger, kwhNeeded = 30): number {
  return Math.max(15, Math.round((kwhNeeded / Math.max(c.powerKw, 1)) * 60));
}
