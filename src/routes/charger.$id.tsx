import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Clock, Zap, Star, Navigation2, Share2, Phone } from "lucide-react";
import { useChargers } from "@/lib/chargers-store";
import { LazyChargerMap } from "@/components/LazyChargerMap";

export const Route = createFileRoute("/charger/$id")({
  component: ChargerDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold">Charger not found</h1>
      <Link to="/explore" className="mt-4 inline-block text-primary">← Back to map</Link>
    </div>
  ),
});

function ChargerDetail() {
  const { id } = Route.useParams();
  const { chargers } = useChargers();
  const c = chargers.find((x) => x.id === id);
  if (!c) throw notFound();

  const share = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: c.name, text: c.description, url: window.location.href }).catch(() => {});
    } else if (typeof navigator !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  const reviews = c.reviews ?? [
    { author: "Priya", rating: 5, comment: "Clean, fast and easy to find." },
    { author: "Rahul", rating: 4, comment: "Worked flawlessly with my Nexon EV." },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Link to="/explore" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to map
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-border">
            <img src={c.image} alt={c.name} className="h-72 w-full object-cover sm:h-96" />
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  c.source === "public" ? "bg-primary/15 text-primary" :
                  c.source === "community" ? "bg-sky-100 text-sky-700" : "bg-amber-100 text-amber-700"
                }`}>{c.source}</span>
                <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{c.name}</h1>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {c.address}
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm font-medium">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> {c.rating}
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{c.description}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Info icon={Zap} label="Power" value={`${c.powerKw} kW · ${c.speed === "fast" ? "Fast" : "Slow"}`} />
              <Info icon={Clock} label="Hours" value={c.hours} />
              <Info icon={MapPin} label="City" value={c.city} />
            </div>

            <div className="mt-6">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Connectors</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {c.connectors.map((k) => (
                  <span key={k} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium">{k}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Reviews</h2>
            <div className="mt-4 space-y-4">
              {reviews.map((r, i) => (
                <div key={i} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{r.author}</div>
                    <div className="flex items-center gap-0.5 text-yellow-400">
                      {Array.from({ length: r.rating }).map((_, k) => <Star key={k} className="h-3.5 w-3.5 fill-yellow-400" />)}
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Availability</div>
                <div className={`text-lg font-semibold ${c.available ? "text-primary" : "text-orange-500"}`}>
                  {c.available ? "Available now" : "Busy"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Price</div>
                <div className="text-lg font-semibold">₹{c.pricePerKwh}/kWh</div>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                <Navigation2 className="h-4 w-4" /> Directions
              </a>
              <button onClick={share} className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold">
                <Share2 className="h-4 w-4" /> Share
              </button>
              {c.phone && (
                <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold">
                  <Phone className="h-4 w-4" /> {c.phone}
                </a>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <button disabled className="cursor-not-allowed rounded-lg border border-dashed border-border p-2">Book (soon)</button>
              <button disabled className="cursor-not-allowed rounded-lg border border-dashed border-border p-2">Chat (soon)</button>
            </div>
          </div>

          <div className="h-64 overflow-hidden rounded-2xl">
            <LazyChargerMap chargers={[c]} center={[c.lat, c.lng]} zoom={14} selectedId={c.id} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-center gap-1 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}