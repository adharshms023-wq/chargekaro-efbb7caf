export const KERALA_DISTRICTS = [
  "Thiruvananthapuram",
  "Kollam",
  "Pathanamthitta",
  "Alappuzha",
  "Kottayam",
  "Idukki",
  "Ernakulam",
  "Thrissur",
  "Palakkad",
  "Malappuram",
  "Kozhikode",
  "Wayanad",
  "Kannur",
  "Kasaragod",
] as const;

export const CONNECTOR_TYPES = [
  "CCS2",
  "Type 2",
  "CHAdeMO",
  "Bharat DC001",
  "Bharat AC001",
] as const;

export interface Station {
  id: string;
  name: string;
  provider: string | null;
  providerLogo: string | null;
  address: string;
  district: string | null;
  city: string | null;
  lat: number;
  lng: number;
  connectors: string[];
  chargingType: string | null;
  maxPowerKw: number | null;
  operatingHours: string | null;
  contactPhone: string | null;
  brands: string[];
  pricing: string | null;
  photos: string[];
  website: string | null;
  availability: string | null;
  rating: number | null;
  reviewCount: number;
}

export interface StationRow {
  id: string;
  name: string;
  provider: string | null;
  provider_logo: string | null;
  address: string;
  district: string | null;
  city: string | null;
  lat: number | string;
  lng: number | string;
  connectors: string[] | null;
  charging_type: string | null;
  max_power_kw: number | string | null;
  operating_hours: string | null;
  contact_phone: string | null;
  brands: string[] | null;
  pricing: string | null;
  photos: string[] | null;
  website: string | null;
  availability: string | null;
  rating: number | string | null;
  review_count: number | null;
}

export function mapStation(row: StationRow): Station {
  return {
    id: row.id,
    name: row.name,
    provider: row.provider,
    providerLogo: row.provider_logo,
    address: row.address,
    district: row.district,
    city: row.city,
    lat: Number(row.lat),
    lng: Number(row.lng),
    connectors: row.connectors ?? [],
    chargingType: row.charging_type,
    maxPowerKw: row.max_power_kw === null ? null : Number(row.max_power_kw),
    operatingHours: row.operating_hours,
    contactPhone: row.contact_phone,
    brands: row.brands ?? [],
    pricing: row.pricing,
    photos: row.photos ?? [],
    website: row.website,
    availability: row.availability,
    rating: row.rating === null ? null : Number(row.rating),
    reviewCount: row.review_count ?? 0,
  };
}

export function navigationLink(s: Pick<Station, "lat" | "lng" | "name">) {
  return `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`;
}

export function isFastCharging(s: Station) {
  return s.chargingType?.includes("DC") === true || (s.maxPowerKw ?? 0) >= 22;
}

export function isOpen247(s: Station) {
  const h = (s.operatingHours ?? "").toLowerCase().replace(/\s/g, "");
  return h === "24/7" || h === "24x7" || h.includes("00:00-24:00");
}