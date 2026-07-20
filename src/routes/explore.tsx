import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Filter, MapPin, SlidersHorizontal, X, Star } from "lucide-react";
import { useChargers } from "@/lib/chargers-store";
import { LazyChargerMap } from "@/components/LazyChargerMap";
import { ChargerDetailsPanel } from "@/components/ChargerDetailsPanel";
import { RoutePlanner } from "@/components/RoutePlanner";
import { CostCalculator } from "@/components/CostCalculator";
import type { ConnectorType } from "@/data/chargers";
import { chargerStatus, defaultPorts, haversineKm, USER_LOCATION } from "@/data/chargers";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore EV Chargers — ChargeShare" },
      { name: "description", content: "Interactive map of EV chargers and community hosts across India." },
      { property: "og:title", content: "Explore EV Chargers — ChargeShare" },
      { property: "og:description", content: "Interactive map of EV chargers and community hosts across India." },
    ],
  }),
  component: Explore,
});

type SourceFilter = "all" | "public" | "community";
type SpeedFilter = "all" | "fast" | "slow";
type PriceFilter = "all" | "free" | "paid";
type StatusFilter = "all" | "available" | "busy" | "offline";

function Explore() {
  const { chargers } = useChargers();
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<SourceFilter>("all");
  const [speed, setSpeed] = useState<SpeedFilter>("all");
  const [connector, setConnector] = useState<"all" | ConnectorType>("all");
  const [price, setPrice] = useState<PriceFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [maxPrice, setMaxPrice] = useState(30);
  const [maxDistance, setMaxDistance] = useState(500);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showTools, setShowTools] = useState(false);

  const withDistance = useMemo(
    () => chargers.map((c) => ({ c, dist: haversineKm(USER_LOCATION, [c.lat, c.lng]) })),
    [chargers]
  );

  const filtered = useMemo(() => {
    return withDistance
      .filter(({ c, dist }) => {
        if (source !== "all" && c.source !== source) return false;
        if (speed !== "all" && c.speed !== speed) return false;
        if (connector !== "all" && !c.connectors.includes(connector)) return false;
        if (price === "free" && c.pricePerKwh > 0) return false;
        if (price === "paid" && c.pricePerKwh <= 0) return false;
        if (c.pricePerKwh > maxPrice) return false;
        if (dist > maxDistance) return false;
        if (status !== "all" && chargerStatus(c) !== status) return false;
        if (query) {
          const q = query.toLowerCase();
          if (!c.name.toLowerCase().includes(q) && !c.city.toLowerCase().includes(q) && !c.address.toLowerCase().includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => a.dist - b.dist)
      .map((x) => x.c);
  }, [withDistance, source, speed, connector, price, maxPrice, maxDistance, status, query]);

  const selected = filtered.find((c) => c.id === selectedId) ?? chargers.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="mx-auto grid max-w-[1500px] gap-4 px-4 py-6 lg:grid-cols-[380px_1fr]">
      {/* Sidebar */}
      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city, area or charger"
              className="w-full bg-transparent text-sm outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear">
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </label>
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Filter className="h-3.5 w-3.5" /> Filters
            </div>
            <FilterGroup label="Type" value={source} onChange={setSource} options={[
              { v: "all", l: "All" },
              { v: "public", l: "Public" },
              { v: "community", l: "Private" },
            ]} />
            <FilterGroup label="Speed" value={speed} onChange={setSpeed} options={[
              { v: "all", l: "All" },
              { v: "fast", l: "Fast" },
              { v: "slow", l: "Slow" },
            ]} />
            <FilterGroup label="Price" value={price} onChange={setPrice} options={[
              { v: "all", l: "All" },
              { v: "free", l: "Free" },
              { v: "paid", l: "Paid" },
            ]} />
            <FilterGroup label="Status" value={status} onChange={setStatus} options={[
              { v: "all", l: "All" },
              { v: "available", l: "Available" },
              { v: "busy", l: "Busy" },
              { v: "offline", l: "Offline" },
            ]} />
            <FilterGroup label="Connector" value={connector} onChange={setConnector} options={[
              { v: "all", l: "All" },
              { v: "CCS2", l: "CCS2" },
              { v: "Type 2", l: "Type 2" },
              { v: "CHAdeMO", l: "CHAdeMO" },
            ]} />

            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Max price</span>
                <span className="font-semibold text-foreground">₹{maxPrice}/kWh</span>
              </div>
              <input type="range" min={5} max={30} value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full accent-primary" />
            </div>
            <div className="mt-2">
              <div className="mb-1 flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Max distance</span>
                <span className="font-semibold text-foreground">{maxDistance} km</span>
              </div>
              <input type="range" min={5} max={800} step={5} value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                className="w-full accent-primary" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Nearby stations</h3>
            <button
              onClick={() => setShowTools((v) => !v)}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium"
            >
              <SlidersHorizontal className="h-3 w-3" /> {showTools ? "Hide tools" : "Route & cost"}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">{filtered.length} results · sorted by distance</p>
          <div className="mt-3 max-h-[440px] space-y-2 overflow-y-auto pr-1">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`w-full rounded-xl border p-3 text-left transition-all ${
                  selectedId === c.id ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{c.name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      <MapPin className="mr-1 inline h-3 w-3" />{c.city}
                      <span className="mx-1">·</span>
                      {haversineKm(USER_LOCATION, [c.lat, c.lng]).toFixed(1)} km
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    c.source === "public" ? "bg-primary/15 text-primary" :
                    c.source === "community" ? "bg-sky-100 text-sky-700" : "bg-amber-100 text-amber-700"
                  }`}>{c.source === "community" ? "Private" : c.source}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {c.powerKw} kW · ₹{c.pricePerKwh}/kWh · {defaultPorts(c)} ports
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{c.rating}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                    chargerStatus(c) === "available" ? "text-emerald-600" :
                    chargerStatus(c) === "busy" ? "text-orange-500" : "text-slate-500"
                  }`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {chargerStatus(c).toUpperCase()}
                  </span>
                  <div className="flex gap-1">
                    {c.connectors.slice(0, 2).map((k) => (
                      <span key={k} className="rounded-full border border-border px-1.5 py-[1px] text-[9px] font-medium">{k}</span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                No chargers match.
              </div>
            )}
          </div>
        </div>

        {showTools && selected && (
          <>
            <RoutePlanner charger={selected} />
            <CostCalculator defaultPrice={selected.pricePerKwh} defaultPowerKw={selected.powerKw} />
          </>
        )}
        {showTools && !selected && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-4 text-center text-xs text-muted-foreground">
            Select a charger to enable Route Planner & Cost Calculator.
          </div>
        )}
      </aside>

      {/* Map */}
      <div className="h-[70vh] min-h-[500px] lg:h-[calc(100vh-8rem)]">
        <LazyChargerMap chargers={filtered} selectedId={selectedId} />
      </div>

      <ChargerDetailsPanel charger={selected} onClose={() => setSelectedId(null)} />
    </div>
  );
}

function FilterGroup<T extends string>({
  label, value, onChange, options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { v: T; l: string }[];
}) {
  return (
    <div className="mb-3">
      <div className="mb-1 text-xs font-medium text-muted-foreground">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              value === o.v ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted"
            }`}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}