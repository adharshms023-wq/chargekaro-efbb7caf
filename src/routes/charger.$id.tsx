import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft, MapPin, Clock, Zap, Star, Navigation2, Share2, Phone, Heart,
  Coffee, Wifi, Car, Utensils, ShoppingBag, Sofa, Bath, ShieldCheck, Users, IndianRupee,
} from "lucide-react";
import { useChargers } from "@/lib/chargers-store";
import { LazyChargerMap } from "@/components/LazyChargerMap";
import { RoutePlanner } from "@/components/RoutePlanner";
import { CostCalculator } from "@/components/CostCalculator";
import { useFavorites } from "@/lib/favorites";
import {
  chargerStatus, defaultFacilities, defaultPorts, haversineKm, USER_LOCATION,
  type Facility,
} from "@/data/chargers";
import { useLiveUpdates, timeAgo, KIND_LABEL } from "@/lib/live-updates";

const FACILITY_ICONS: Record<Facility, React.ComponentType<{ className?: string }>> = {
  Restroom: Bath,
  Cafe: Coffee,
  "Wi-Fi": Wifi,
  Parking: Car,
  Shopping: ShoppingBag,
  Restaurant: Utensils,
  Lounge: Sofa,
};

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
  const { chargers, isLoading } = useChargers();
  const c = chargers.find((x) => x.id === id);
  if (!c) {
    if (isLoading) {
      return <div className="mx-auto max-w-xl px-4 py-20 text-center text-sm text-muted-foreground">Loading charger…</div>;
    }
    throw notFound();
  }
  const { isFavorite, toggleFavorite } = useFavorites();
  const { updatesFor } = useLiveUpdates();
  const status = chargerStatus(c);
  const facilities = defaultFacilities(c);
  const ports = defaultPorts(c);
  const distance = haversineKm(USER_LOCATION, [c.lat, c.lng]);
  const liveUpdates = updatesFor(c.id);

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
          <div className="relative overflow-hidden rounded-3xl border border-border">
            <img src={c.image} alt={c.name} className="h-72 w-full object-cover sm:h-96" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute left-4 top-4 flex gap-2">
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase text-white backdrop-blur ${
                c.source === "community" ? "bg-sky-500/90" : c.source === "place" ? "bg-amber-500/90" : "bg-primary/90"
              }`}>
                {c.source === "community" ? "Private" : c.source === "place" ? "EV-friendly" : "Public"}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase text-white backdrop-blur ${
                status === "available" ? "bg-emerald-500/90" : status === "busy" ? "bg-orange-500/90" : "bg-slate-600/90"
              }`}>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> {status}
              </span>
            </div>
            <button
              onClick={() => toggleFavorite(c.id)}
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow-md backdrop-blur transition-transform hover:scale-105"
              aria-label="Save"
            >
              <Heart className={`h-4 w-4 ${isFavorite(c.id) ? "fill-red-500 text-red-500" : ""}`} />
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">{c.name}</h1>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {c.address}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{distance.toFixed(1)} km from you</p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm font-medium">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> {c.rating}
                <span className="text-muted-foreground">({c.reviewCount ?? reviews.length})</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{c.description}</p>

            <div className="mt-6 grid gap-3 grid-cols-2 sm:grid-cols-4">
              <Info icon={Zap} label="Power" value={`${c.powerKw} kW`} />
              <Info icon={Clock} label="Speed" value={c.speed === "fast" ? "Fast DC" : "Slow AC"} />
              <Info icon={Users} label="Ports" value={String(ports)} />
              <Info icon={Clock} label="Hours" value={c.hours} />
            </div>

            <div className="mt-6">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Connectors</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {c.connectors.map((k) => (
                  <span key={k} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium">{k}</span>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Facilities</div>
              <div className="mt-2 grid gap-2 grid-cols-2 sm:grid-cols-3">
                {facilities.map((f) => {
                  const Icon = FACILITY_ICONS[f];
                  return (
                    <div key={f} className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm">
                      <Icon className="h-4 w-4 text-primary" /> {f}
                    </div>
                  );
                })}
              </div>
            </div>

            {c.source === "community" && (
              <div className="mt-6 rounded-2xl border border-border bg-background p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/15 text-primary font-semibold">
                    {(c.ownerName ?? "H").slice(0, 1)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-semibold">{c.ownerName ?? "Community Host"}</span>
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="text-xs text-muted-foreground">Verified host · usually responds within 1 hour</div>
                  </div>
                  {c.phone && (
                    <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                      <Phone className="h-3 w-3" /> Call
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {liveUpdates.length > 0 && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
              <h2 className="text-lg font-semibold">Live from the community</h2>
              <div className="mt-3 space-y-2">
                {liveUpdates.map((u) => (
                  <div key={u.id} className="rounded-xl bg-background p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-primary">{KIND_LABEL[u.kind]}</div>
                    <div className="mt-0.5 text-sm">{u.message}</div>
                    <div className="mt-1 text-[11px] text-muted-foreground">— {u.author} · {timeAgo(u.createdAt)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Reviews</h2>
              <span className="text-xs text-muted-foreground">{c.reviewCount ?? reviews.length} total</span>
            </div>
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

          <CostCalculator defaultPrice={c.pricePerKwh} defaultPowerKw={c.powerKw} />
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Availability</div>
                <div className={`text-lg font-semibold ${
                  status === "available" ? "text-primary" : status === "busy" ? "text-orange-500" : "text-slate-500"
                }`}>
                  {status === "available" ? "Available now" : status === "busy" ? "Busy" : "Offline"}
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
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => toggleFavorite(c.id)} className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold">
                  <Heart className={`h-4 w-4 ${isFavorite(c.id) ? "fill-red-500 text-red-500" : ""}`} /> Save
                </button>
                <button onClick={share} className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold">
                  <Share2 className="h-4 w-4" /> Share
                </button>
              </div>
              {c.phone && (
                <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold">
                  <Phone className="h-4 w-4" /> {c.phone}
                </a>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <button disabled className="cursor-not-allowed rounded-lg border border-dashed border-border p-2">Book slot</button>
              <button disabled className="cursor-not-allowed rounded-lg border border-dashed border-border p-2">Chat host</button>
            </div>
          </div>

          <RoutePlanner charger={c} />

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