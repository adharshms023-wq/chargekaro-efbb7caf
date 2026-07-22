import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { mapDbCharger, type Charger } from "@/data/chargers";

// Kept as a passthrough for backwards compatibility with __root wiring.
export function ChargersProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

async function fetchChargers(): Promise<Charger[]> {
  const { data, error } = await supabase
    .from("chargers")
    .select(
      "id, owner_id, name, address, city, lat, lng, source, power_kw, speed, connectors, price_per_kwh, hours, description, image, phone, owner_name, facilities, rules, payhip_product_url, payhip_mode",
    )
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((r) => mapDbCharger(r as any));
}

export function useChargers() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["chargers"], queryFn: fetchChargers, staleTime: 30_000 });
  return {
    chargers: q.data ?? [],
    isLoading: q.isLoading,
    error: q.error as Error | null,
    refresh: () => qc.invalidateQueries({ queryKey: ["chargers"] }),
    // no-op kept for legacy callers
    addCharger: (_c: Charger) => qc.invalidateQueries({ queryKey: ["chargers"] }),
  };
}
