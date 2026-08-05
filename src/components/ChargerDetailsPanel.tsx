import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  X, MapPin, Star, Zap, Clock, Navigation2, Share2, Heart, CalendarCheck,
  Phone, Users, Coffee, Wifi, Car, Utensils, ShoppingBag, Sofa, Bath,
  Radio, IndianRupee,
} from "lucide-react";
import type { Charger, Facility } from "@/data/chargers";
import {
  chargerStatus, defaultFacilities, defaultPorts, estimatedChargeMins,
  haversineKm, USER_LOCATION,
} from "@/data/chargers";
import { useFavorites } from "@/lib/favorites";
import { useLiveUpdates, timeAgo, KIND_LABEL } from "@/lib/live-updates";
import { useChargerPhone } from "@/lib/chargers-store";

const FACILITY_ICONS: Record<Facility, React.ComponentType<{ className?: string }>> = {
  Restroom: Bath,
  Cafe: Coffee,
  "Wi-Fi": Wifi,
  Parking: Car,
  Shopping: ShoppingBag,
  Restaurant: Utensils,
  Lounge: Sofa,
};

interface Props {
  charger: Charger | null;
  onClose: () => void;
}

export function ChargerDetailsPanel({ charger, onClose }: Props) {
  const phone = useChargerPhone(charger?.id);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const { isFavorite, toggleFavorite } = useFavorites();
  const { updatesFor } = useLiveUpdates();

  if (!charger) return null;
  const c = charger;
  const status = chargerStatus(c);
  const ports = defaultPorts(c);
  const facilities = defaultFacilities(c);
  const distance = haversineKm(USER_LOCATION, [c.lat, c.lng]);
  const chargeMins = estimatedChargeMins(c);
  const reviewCount = c.reviewCount ?? (c.reviews?.length ?? 24);
  const liveUpdates = updatesFor(c.id);
  const isPrivate = c.source === "community";

  const share = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: c.name, url: window.location.href }).catch(() => {});
    } else if (typeof navigator !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-fade-in"
        aria-hidden
      />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col overflow-y-auto bg-background shadow-2xl animate-slide-in-right"
        role="dialog"
        aria-label={`Details for ${c.name}`}
      >
        {/* Cover */}
        <div className="relative">
          <img src={c.image} alt={c.name} className="h-64 w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <button
            onClick={onClose}
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-md backdrop-blur transition-transform hover:scale-105"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            onClick={() => toggleFavorite(c.id)}
            className="absolute right-16 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-md backdrop-blur transition-transform hover:scale-105"
            aria-label="Save"
          >
            <Heart className={`h-4 w-4 ${isFavorite(c.id) ? "fill-red-500 text-red-500" : ""}`} />
          </button>
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur ${
              isPrivate ? "bg-sky-500/90 text-white" : "bg-primary/90 text-primary-foreground"
            }`}>
              {isPrivate ? "Private" : c.source === "place" ? "EV-friendly" : "Public"}
            </span>
            <StatusPill status={status} />
            <span className="ml-auto flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /> {c.rating}
              <span className="text-muted-foreground">({reviewCount})</span>
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="px-6 pt-5">
          <h2 className="text-2xl font-bold tracking-tight">{c.name}</h2>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" /> {c.address}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Chip>{distance.toFixed(1)} km away</Chip>
            <Chip>~{chargeMins} min to charge</Chip>
            <Chip>{ports} {ports === 1 ? "port" : "ports"}</Chip>
          </div>
        </div>

        {/* Key facts grid */}
        <div className="mx-6 mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Fact icon={Zap} label="Power" value={`${c.powerKw} kW`} />
          <Fact icon={Clock} label="Speed" value={c.speed === "fast" ? "Fast DC" : "Slow AC"} />
          <Fact icon={Users} label="Ports" value={String(ports)} />
          <Fact icon={Clock} label="Hours" value={c.hours} />
        </div>

        {/* Price */}
        <div className="mx-6 mt-4 flex items-center justify-between rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-transparent p-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Price</div>
            <div className="text-2xl font-bold text-primary">₹{c.pricePerKwh}<span className="text-sm font-medium text-muted-foreground">/kWh</span></div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <div>Est. full charge</div>
            <div className="text-sm font-semibold text-foreground">₹{Math.round(c.pricePerKwh * 30)}</div>
          </div>
        </div>

        {/* Connectors */}
        <div className="px-6 pt-5">
          <SectionTitle>Connectors</SectionTitle>
          <div className="mt-2 flex flex-wrap gap-2">
            {c.connectors.map((k) => (
              <span key={k} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium">{k}</span>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="px-6 pt-5">
          <SectionTitle>About</SectionTitle>
          <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>
        </div>

        {/* Facilities */}
        <div className="px-6 pt-5">
          <SectionTitle>Facilities</SectionTitle>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
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

        {/* Owner (community) */}
        {isPrivate && (
          <div className="px-6 pt-5">
            <SectionTitle>Host</SectionTitle>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-border bg-background p-4">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/15 text-primary font-semibold">
                {(c.ownerName ?? "H").slice(0, 1)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{c.ownerName ?? "Community Host"}</div>
                <div className="text-xs text-muted-foreground">Verified community host</div>
              </div>
              {c.phone && (
                <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Phone className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Live updates */}
        {liveUpdates.length > 0 && (
          <div className="px-6 pt-5">
            <SectionTitle>
              <span className="inline-flex items-center gap-1.5"><Radio className="h-3.5 w-3.5 text-primary" /> Live from the community</span>
            </SectionTitle>
            <div className="mt-2 space-y-2">
              {liveUpdates.map((u) => (
                <div key={u.id} className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-primary">
                    <span>{KIND_LABEL[u.kind]}</span>
                    <span className="text-muted-foreground">{timeAgo(u.createdAt)}</span>
                  </div>
                  <div className="mt-1 text-sm">{u.message}</div>
                  <div className="mt-1 text-xs text-muted-foreground">— {u.author}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="px-6 pt-5">
          <SectionTitle>Reviews</SectionTitle>
          <div className="mt-2 space-y-2">
            {(c.reviews ?? [
              { author: "Priya", rating: 5, comment: "Clean, fast and easy to find." },
              { author: "Rahul", rating: 4, comment: "Worked flawlessly with my Nexon EV." },
            ]).slice(0, 3).map((r, i) => (
              <div key={i} className="rounded-xl border border-border bg-background p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{r.author}</div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: r.rating }).map((_, k) => (
                      <Star key={k} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="h-24" />

        {/* Sticky action bar */}
        <div className="sticky bottom-0 mt-auto border-t border-border bg-background/95 p-4 backdrop-blur">
          <div className="grid grid-cols-4 gap-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`}
              target="_blank"
              rel="noreferrer"
              className="col-span-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-transform hover:scale-[1.02]"
            >
              <Navigation2 className="h-4 w-4" /> Navigate
            </a>
            <button
              onClick={() => toggleFavorite(c.id)}
              className="inline-flex items-center justify-center gap-1 rounded-full border border-border bg-background py-2.5 text-xs font-semibold"
            >
              <Heart className={`h-4 w-4 ${isFavorite(c.id) ? "fill-red-500 text-red-500" : ""}`} /> Save
            </button>
            <button
              onClick={share}
              className="inline-flex items-center justify-center gap-1 rounded-full border border-border bg-background py-2.5 text-xs font-semibold"
            >
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>
          {c.payhipUrl && (
            <a
              href={c.payhipUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 py-2.5 text-sm font-semibold text-white"
            >
              <IndianRupee className="h-4 w-4" /> Pay host on Payhip
            </a>
          )}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              disabled
              title="Booking is UI-only in this MVP"
              className="inline-flex cursor-not-allowed items-center justify-center gap-1 rounded-full border border-dashed border-border bg-muted/30 py-2 text-xs font-semibold text-muted-foreground"
            >
              <CalendarCheck className="h-4 w-4" /> Book slot
            </button>
            <Link
              to="/charger/$id"
              params={{ id: c.id }}
              className="inline-flex items-center justify-center rounded-full border border-border bg-background py-2 text-xs font-semibold"
            >
              Full details →
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{children}</div>;
}

function Fact({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-muted px-2.5 py-1 font-medium">{children}</span>;
}

function StatusPill({ status }: { status: "available" | "busy" | "offline" }) {
  const map = {
    available: { label: "Available", cls: "bg-emerald-500/90 text-white" },
    busy: { label: "Busy", cls: "bg-orange-500/90 text-white" },
    offline: { label: "Offline", cls: "bg-slate-600/90 text-white" },
  } as const;
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur ${s.cls}`}>
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> {s.label}
    </span>
  );
}