import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mapStation, type Station, type StationRow } from "@/data/stations";

const COLUMNS =
  "id, name, provider, provider_logo, address, district, city, lat, lng, connectors, charging_type, max_power_kw, operating_hours, contact_phone, brands, pricing, photos, website, availability, rating, review_count";

export async function fetchStations(): Promise<Station[]> {
  const { data, error } = await supabase
    .from("stations")
    .select(COLUMNS)
    .eq("is_published", true)
    .order("district", { ascending: true })
    .limit(5000);
  if (error) throw error;
  return (data ?? []).map((r) => mapStation(r as unknown as StationRow));
}

export function useStations() {
  const q = useQuery({ queryKey: ["stations"], queryFn: fetchStations, staleTime: 60_000 });
  return {
    stations: q.data ?? [],
    isLoading: q.isLoading,
    error: q.error as Error | null,
  };
}