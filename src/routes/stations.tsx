import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  MapPin, Navigation, Phone, Clock, Zap, Search, Globe, SlidersHorizontal,
  X, Map as MapIcon, List as ListIcon, Star, BatteryCharging, Building2,
  LocateFixed, Loader2,
} from "lucide-react";
import { useStations } from "@/lib/stations-store";
import { useChargers } from "@/lib/chargers-store";
import {
  CONNECTOR_TYPES,
  KERALA_DISTRICTS,
  distanceKm,
  formatDistance,
  isFastCharging,
  isOpen247,
  navigationLinkFrom,
  type Station,
} from "@/data/stations";
import { LazyStationMap } from "@/components/LazyStationMap";
import { useGeolocation, type Coords } from "@/hooks/use-geolocation";

export const Route = createFileRoute("/stations")({
  component: StationsPage,
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "EV Charging Stations in Kerala | ChargeKaro Directory" },
      {
        name: "description",
        content:
          "Browse real EV charging stations across all Kerala districts. Filter by district, provider, connector type, fast charging and 24x7 availability, with a live map and Google Maps navigation.",
      },
      { property: "og:title", content: "EV Charging Stations in Kerala | ChargeKaro" },
      {
        property: "og:description",
        content: "A live directory of EV charging stations across Kerala with map, filters and navigation links.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
        active
          ? "border-primary/40 bg-primary/15 text-primary shadow-sm shadow-primary/20"
          : "border-border bg-background/60 text-foreground/70 hover:border-primary/30 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Stat({ icon: Icon, value, label }: { icon: typeof Zap; value: string | number; label: string }) {
  return (
    <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <div className="min-w-0">
        <p className="text-lg font-black leading-none">{value}</p>
        <p className="truncate text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="glass animate-pulse rounded-2xl border border-border/60 p-4">
      <div className="flex gap-3">
        <div className="h-10 w-10 rounded-xl bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-2/3 rounded bg-muted" />
          <div className="h-2.5 w-1/3 rounded bg-muted" />
        </div>
      </div>
      <div className="mt-4 h-2.5 w-full rounded bg-muted" />
      <div className="mt-2 h-2.5 w-4/5 rounded bg-muted" />
      <div className="mt-4 h-8 w-full rounded-full bg-muted" />
    </div>
  );
}

function StationCard({
  s,
  active,
  onSelect,
  distance,
  origin,
}: {
  s: Station;
  active: boolean;
  onSelect: () => void;
  distance?: number;
  origin?: Coords | null;
}) {
  return (
    <article
      onClick={onSelect}
      className={`glass group cursor-pointer rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/10 ${
        active ? "border-primary/50 ring-2 ring-primary/30" : "border-border/60"
      }`}
    >
      <div className="flex items-start gap-3">
        {s.providerLogo ? (
          <img src={s.providerLogo} alt={`${s.provider ?? "Provider"} logo`} className="h-10 w-10 rounded-xl object-contain" loading="lazy" />
        ) : (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <Zap className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold group-hover:text-primary">{s.name}</h3>
          <p className="truncate text-xs text-muted-foreground">{s.provider ?? "Independent operator"}</p>
        </div>
        {s.chargingType && (
          <span className="rounded-full bg-secondary/15 px-2 py-1 text-[10px] font-bold text-secondary">{s.chargingType}</span>
        )}
      </div>

      {distance != null && (
        <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] font-bold text-secondary">
          <Navigation className="h-3 w-3" /> {formatDistance(distance)} away
        </p>
      )}

      <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> <span className="line-clamp-2">{s.address}</span>
      </p>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {s.connectors.map((c) => (
          <span key={c} className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium">{c}</span>
        ))}
        {s.maxPowerKw && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{s.maxPowerKw} kW</span>
        )}
        {isFastCharging(s) && (
          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">Fast</span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        {s.operatingHours && (
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {s.operatingHours}</span>
        )}
        {s.rating != null && (
          <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-current" /> {s.rating}</span>
        )}
        {s.contactPhone && (
          <a href={`tel:${s.contactPhone}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 hover:text-foreground">
            <Phone className="h-3.5 w-3.5" /> {s.contactPhone}
          </a>
        )}
        {s.website && (
          <a href={s.website} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 hover:text-foreground">
            <Globe className="h-3.5 w-3.5" /> Website
          </a>
        )}
        {s.pricing && <span>{s.pricing}</span>}
        {s.availability && <span className="font-semibold text-primary">{s.availability}</span>}
      </div>

      <a
        href={navigationLinkFrom(s, origin)}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full gradient-primary px-4 py-2 text-xs font-bold shadow-lg shadow-primary/20"
      >
        <Navigation className="h-3.5 w-3.5" /> Navigate
      </a>
    </article>
  );
}

function StationsPage() {
  const { stations, isLoading, error } = useStations();
  const { chargers } = useChargers();
  const { q: initialQ } = Route.useSearch();
  const [q, setQ] = useState(initialQ ?? "");
  const [district, setDistrict] = useState("All");
  const [provider, setProvider] = useState("All");
  const [connector, setConnector] = useState("All");
  const [fastOnly, setFastOnly] = useState(false);
  const [openNow, setOpenNow] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [limit, setLimit] = useState(18);
  const [selected, setSelected] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const { coords, status: geoStatus, error: geoError, request: locateMe, clear: clearLocation } = useGeolocation();
  const [radiusKm, setRadiusKm] = useState<number | null>(25);

  /** Community-listed chargers/places, normalised so they can share the map. */
  const communityStations = useMemo<Station[]>(
    () =>
      chargers
        .filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lng))
        .map((c) => ({
          id: c.id,
          name: c.name,
          provider: c.ownerName ?? "Community host",
          providerLogo: null,
          address: c.address,
          district: null,
          city: c.city ?? null,
          lat: c.lat,
          lng: c.lng,
          connectors: c.connectors ?? [],
          chargingType: c.speed === "fast" ? "DC" : "AC",
          maxPowerKw: c.powerKw ?? null,
          operatingHours: c.hours ?? null,
          contactPhone: c.phone ?? null,
          brands: [],
          pricing: c.pricePerKwh ? `₹${c.pricePerKwh}/kWh` : null,
          photos: c.image ? [c.image] : [],
          website: null,
          availability: null,
          rating: c.rating ?? null,
          reviewCount: c.reviewCount ?? 0,
          source: "community" as const,
        })),
    [chargers],
  );

  const providers = useMemo(
    () => Array.from(new Set(stations.map((s) => s.provider).filter(Boolean) as string[])).sort(),
    [stations],
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = stations.filter((s) => {
      if (district !== "All" && s.district !== district) return false;
      if (provider !== "All" && s.provider !== provider) return false;
      if (connector !== "All" && !s.connectors.includes(connector)) return false;
      if (fastOnly && !isFastCharging(s)) return false;
      if (openNow && !isOpen247(s)) return false;
      if (availableOnly && (s.availability ?? "").toLowerCase() !== "available") return false;
      if (!term) return true;
      return [s.name, s.city, s.district, s.provider, s.address]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(term));
    });

    if (!coords) return list;

    return list
      .map((s) => ({ s, d: distanceKm(coords, s) }))
      .filter(({ d }) => radiusKm == null || d <= radiusKm)
      .sort((a, b) => a.d - b.d)
      .map(({ s }) => s);
  }, [stations, q, district, provider, connector, fastOnly, openNow, availableOnly, coords, radiusKm]);

  const distanceOf = (s: Station) => (coords ? distanceKm(coords, s) : undefined);

  const activeFilters =
    (district !== "All" ? 1 : 0) + (provider !== "All" ? 1 : 0) + (connector !== "All" ? 1 : 0) +
    (fastOnly ? 1 : 0) + (openNow ? 1 : 0) + (availableOnly ? 1 : 0) + (q.trim() ? 1 : 0);

  const reset = () => {
    setQ(""); setDistrict("All"); setProvider("All"); setConnector("All");
    setFastOnly(false); setOpenNow(false); setAvailableOnly(false);
  };

  const dcCount = filtered.filter((s) => isFastCharging(s)).length;
  const districtCount = new Set(filtered.map((s) => s.district).filter(Boolean)).size;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
          <BatteryCharging className="h-3.5 w-3.5" /> Kerala charging network
        </span>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
          Charging stations across Kerala
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          A live, continuously updated directory of publicly accessible EV charging stations — search, filter and
          navigate in one tap.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat icon={Zap} value={stations.length} label="Stations listed" />
          <Stat icon={BatteryCharging} value={dcCount} label="Fast charging" />
          <Stat icon={MapPin} value={districtCount} label="Districts covered" />
          <Stat icon={Building2} value={providers.length} label="Providers" />
        </div>
      </header>

      {/* Search + filters */}
      <div className="glass z-30 mb-6 rounded-2xl border border-border/60 p-3 shadow-lg shadow-foreground/5 sm:p-4 lg:sticky lg:top-16">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <div className="relative min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search station or city"
              className="w-full min-w-0 rounded-full border border-border bg-background py-2.5 pl-9 pr-9 text-sm outline-none focus:border-primary"
            />
            {q && (
              <button onClick={() => setQ("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2.5 text-xs font-bold transition-colors ${
              showFilters || activeFilters > 0
                ? "border-primary/40 bg-primary/15 text-primary"
                : "border-border bg-background text-foreground/80"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilters > 0 && (
              <span className="grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {!coords && (
          <button
            onClick={locateMe}
            disabled={geoStatus === "locating"}
            className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-full gradient-primary px-4 py-2 text-xs font-bold shadow-lg shadow-primary/20 disabled:opacity-70 sm:w-auto"
          >
            {geoStatus === "locating" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LocateFixed className="h-3.5 w-3.5" />}
            {geoStatus === "locating" ? "Getting your location…" : "Find stations near me"}
          </button>
        )}

        {showFilters && (
        <>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <select value={district} onChange={(e) => setDistrict(e.target.value)} className="rounded-full border border-border bg-background px-3 py-2 text-sm">
            <option value="All">All districts</option>
            {KERALA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={provider} onChange={(e) => setProvider(e.target.value)} className="rounded-full border border-border bg-background px-3 py-2 text-sm">
            <option value="All">All providers</option>
            {providers.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={connector} onChange={(e) => setConnector(e.target.value)} className="rounded-full border border-border bg-background px-3 py-2 text-sm">
            <option value="All">All connectors</option>
            {CONNECTOR_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Chip active={fastOnly} onClick={() => setFastOnly((v) => !v)}>Fast charging</Chip>
          <Chip active={openNow} onClick={() => setOpenNow((v) => !v)}>Open 24×7</Chip>
          <Chip active={availableOnly} onClick={() => setAvailableOnly((v) => !v)}>Available now</Chip>
          {activeFilters > 0 && (
            <button onClick={reset} className="ml-auto inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" /> Clear {activeFilters}
            </button>
          )}
        </div>
        </>
        )}

        {coords && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
              <LocateFixed className="h-3.5 w-3.5" /> Near you
            </span>
            {[5, 10, 25, 50].map((r) => (
              <Chip key={r} active={radiusKm === r} onClick={() => setRadiusKm(r)}>{r} km</Chip>
            ))}
            <Chip active={radiusKm === null} onClick={() => setRadiusKm(null)}>Any</Chip>
            <button
              onClick={clearLocation}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        {geoError && <p className="mt-2 text-xs text-destructive">{geoError}</p>}
      </div>

      {error && (
        <p className="mb-4 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          Could not load stations: {error.message}
        </p>
      )}

      {/* Mobile view switch */}
      <div className="mb-4 flex gap-1 rounded-full border border-border p-1 lg:hidden">
        {(["list", "map"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setMobileView(v)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold capitalize transition-colors ${
              mobileView === v ? "gradient-primary shadow-md shadow-primary/20" : "text-muted-foreground"
            }`}
          >
            {v === "list" ? <ListIcon className="h-3.5 w-3.5" /> : <MapIcon className="h-3.5 w-3.5" />} {v}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
        {/* Results */}
        <section className={mobileView === "map" ? "hidden lg:block" : ""}>
          <p className="mb-3 text-sm text-muted-foreground">
            {isLoading
              ? "Loading stations…"
              : `${filtered.length} station${filtered.length === 1 ? "" : "s"} found${
                  coords ? (radiusKm ? ` within ${radiusKm} km of you` : " near you") : ""
                }`}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
              : filtered.slice(0, limit).map((s) => (
                  <StationCard
                    key={s.id}
                    s={s}
                    active={selected === s.id}
                    onSelect={() => setSelected(s.id)}
                    distance={distanceOf(s)}
                    origin={coords}
                  />
                ))}
          </div>

          {!isLoading && filtered.length > limit && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setLimit((l) => l + 18)}
                className="rounded-full border border-border px-5 py-2 text-sm font-semibold hover:bg-muted"
              >
                Load {Math.min(18, filtered.length - limit)} more
              </button>
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <p className="text-sm text-muted-foreground">
                {coords && radiusKm
                  ? `No stations within ${radiusKm} km of you — try a wider radius.`
                  : "No stations match these filters yet."}
              </p>
              <button onClick={reset} className="mt-3 rounded-full gradient-primary px-4 py-2 text-xs font-bold">
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* Map */}
        <aside className={mobileView === "list" ? "hidden lg:block" : ""}>
          <div className="lg:sticky lg:top-64">
            <div className="h-[60vh] min-h-[380px] lg:h-[calc(100vh-19rem)]">
              <LazyStationMap
                stations={[...filtered, ...communityStations]}
                onSelect={setSelected}
                userLocation={coords}
              />
            </div>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Pins cluster automatically · tap a pin for details and navigation
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
