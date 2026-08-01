import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MapPin, Navigation, Phone, Clock, Zap, Search, Globe, Filter } from "lucide-react";
import { useStations } from "@/lib/stations-store";
import {
  CONNECTOR_TYPES,
  KERALA_DISTRICTS,
  isFastCharging,
  isOpen247,
  navigationLink,
  type Station,
} from "@/data/stations";
import { LazyStationMap } from "@/components/LazyStationMap";

export const Route = createFileRoute("/stations")({
  component: StationsPage,
  head: () => ({
    meta: [
      { title: "EV Charging Stations in Kerala | ChargeKaro Directory" },
      {
        name: "description",
        content:
          "Browse real EV charging stations across all Kerala districts. Filter by district, provider, connector type, fast charging and 24x7 availability, with map view and Google Maps navigation.",
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
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        active ? "border-primary bg-primary/15 text-primary" : "border-border text-foreground/70 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function StationCard({ s }: { s: Station }) {
  return (
    <article className="glass rounded-2xl border border-border/60 p-4 transition-transform hover:-translate-y-0.5">
      <div className="flex items-start gap-3">
        {s.providerLogo ? (
          <img src={s.providerLogo} alt={`${s.provider ?? "Provider"} logo`} className="h-10 w-10 rounded-xl object-contain" loading="lazy" />
        ) : (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <Zap className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold">{s.name}</h3>
          <p className="truncate text-xs text-muted-foreground">{s.provider ?? "Independent operator"}</p>
        </div>
        {s.chargingType && (
          <span className="rounded-full bg-secondary/15 px-2 py-1 text-[10px] font-bold text-secondary">{s.chargingType}</span>
        )}
      </div>

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
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        {s.operatingHours && (
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {s.operatingHours}</span>
        )}
        {s.contactPhone && (
          <a href={`tel:${s.contactPhone}`} className="inline-flex items-center gap-1 hover:text-foreground">
            <Phone className="h-3.5 w-3.5" /> {s.contactPhone}
          </a>
        )}
        {s.website && (
          <a href={s.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
            <Globe className="h-3.5 w-3.5" /> Website
          </a>
        )}
        {s.pricing && <span>{s.pricing}</span>}
        {s.availability && <span className="font-semibold text-primary">{s.availability}</span>}
      </div>

      <a
        href={navigationLink(s)}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full gradient-primary px-4 py-2 text-xs font-bold shadow-lg shadow-primary/20"
      >
        <Navigation className="h-3.5 w-3.5" /> Navigate
      </a>
    </article>
  );
}

function StationsPage() {
  const { stations, isLoading, error } = useStations();
  const [q, setQ] = useState("");
  const [district, setDistrict] = useState<string>("All");
  const [provider, setProvider] = useState<string>("All");
  const [connector, setConnector] = useState<string>("All");
  const [fastOnly, setFastOnly] = useState(false);
  const [openNow, setOpenNow] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [limit, setLimit] = useState(24);

  const providers = useMemo(
    () => Array.from(new Set(stations.map((s) => s.provider).filter(Boolean) as string[])).sort(),
    [stations],
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return stations.filter((s) => {
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
  }, [stations, q, district, provider, connector, fastOnly, openNow, availableOnly]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Charging Stations in Kerala</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          A live directory of publicly accessible EV charging stations across Kerala. Data is loaded from our database and
          updated as new stations come online.
        </p>
      </header>

      <div className="glass mb-6 rounded-2xl border border-border/60 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search station, city, district or provider"
            className="w-full min-w-0 rounded-full border border-border bg-background py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>

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
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Filter className="h-3.5 w-3.5" /> Quick filters</span>
          <Chip active={fastOnly} onClick={() => setFastOnly((v) => !v)}>Fast charging</Chip>
          <Chip active={openNow} onClick={() => setOpenNow((v) => !v)}>Open 24×7</Chip>
          <Chip active={availableOnly} onClick={() => setAvailableOnly((v) => !v)}>Available now</Chip>
        </div>
      </div>

      <div className="mb-6 h-[420px]">
        <LazyStationMap stations={filtered} />
      </div>

      {error && <p className="text-sm text-destructive">Could not load stations: {error.message}</p>}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading stations…</p>
      ) : (
        <>
          <p className="mb-3 text-sm text-muted-foreground">
            {filtered.length} station{filtered.length === 1 ? "" : "s"} found
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.slice(0, limit).map((s) => <StationCard key={s.id} s={s} />)}
          </div>
          {filtered.length > limit && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setLimit((l) => l + 24)}
                className="rounded-full border border-border px-5 py-2 text-sm font-semibold hover:bg-muted"
              >
                Load more
              </button>
            </div>
          )}
          {filtered.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No stations match these filters yet.
            </p>
          )}
        </>
      )}
    </main>
  );
}