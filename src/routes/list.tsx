import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ChargerForm } from "@/components/ChargerForm";

export const Route = createFileRoute("/list")({
  head: () => ({
    meta: [
      { title: "List Your Charger — ChargeShare" },
      { name: "description", content: "Share your home or business EV charger and get paid via Payhip." },
      { property: "og:title", content: "List Your Charger — ChargeShare" },
      { property: "og:description", content: "Share your home or business EV charger with the ChargeShare community." },
    ],
  }),
  component: ListCharger,
});

function ListCharger() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Sign in to list a charger</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Hosts need an account so we can attribute earnings and let you manage your listings.
        </p>
        <Link
          to="/auth"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Sign in or create an account
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">List your charger</h1>
        <p className="mt-2 text-muted-foreground">
          Add your home or business charger to the community map. Drivers pay you through your Payhip product link.
        </p>
      </div>
      <ChargerForm mode="create" ownerId={user.id} onDone={() => navigate({ to: "/dashboard" })} />
    </div>
  );
}
