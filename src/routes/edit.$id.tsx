import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ChargerForm } from "@/components/ChargerForm";
import { mapDbCharger, type Charger } from "@/data/chargers";

export const Route = createFileRoute("/edit/$id")({
  head: () => ({
    meta: [
      { title: "Edit Charger — ChargeShare" },
      { name: "description", content: "Update your charger listing details, pricing and availability." },
      { property: "og:title", content: "Edit Charger — ChargeShare" },
      { property: "og:description", content: "Update your ChargeShare listing." },
    ],
  }),
  component: EditCharger,
});

function EditCharger() {
  const { id } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const q = useQuery({
    queryKey: ["charger", id],
    enabled: !!user,
    queryFn: async (): Promise<Charger | null> => {
      const { data, error } = await supabase
        .from("chargers")
        .select(
          "id, owner_id, name, address, city, lat, lng, source, power_kw, speed, connectors, price_per_kwh, hours, description, image, phone, owner_name, facilities, rules, payhip_product_url, payhip_mode",
        )
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data ? mapDbCharger(data as any) : null;
    },
  });

  if (loading || q.isLoading) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Sign in to edit</h1>
        <Link to="/auth" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Sign in</Link>
      </div>
    );
  }

  const charger = q.data;
  if (!charger) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-muted-foreground">Charger not found.</div>;
  }
  if (charger.ownerId !== user.id) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-muted-foreground">You can only edit your own chargers.</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Edit your charger</h1>
        <p className="mt-2 text-muted-foreground">Update the details, pricing or availability of this listing.</p>
      </div>
      <ChargerForm mode="edit" ownerId={user.id} chargerId={charger.id} initial={charger} onDone={() => navigate({ to: "/dashboard" })} />
    </div>
  );
}