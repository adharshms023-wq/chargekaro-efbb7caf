import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Filter, MapPin } from "lucide-react";
import { useChargers } from "@/lib/chargers-store";
import { ClientOnly } from "@/components/ClientOnly";
import { ChargerMap } from "@/components/ChargerMap";
import type { ConnectorType } from "@/data/chargers";

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

function Explore() {
  const { chargers } = useChargers();
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<SourceFilter>("all");
  const [speed, setSpeed] = useState<SpeedFilter>("all");
  const [connector, setConnector] = useState<"all" | ConnectorType>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return chargers.filter((c) => {
      if (source !== "all" && c.source !== source) return false;
      if (speed !== "all" && c.speed !== speed) return false;
      if (connector !== "all" && !c.connectors.includes(connector)) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !c.city.toLowerCase().includes(q) && !c.address.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [chargers, source, speed, connector, query]);

  return (
    <div className="mx-auto grid max-w-[1400px] gap-4 px-4 py-6 lg:grid-cols-[360px_1fr]">
      {/* Sidebar */}
      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city, area or charger"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Filter className="h-3.5 w-3.5" /> Filters
            </div>
            <FilterGroup label="Type" value={source} onChange={setSource} options={[
              { v: "all", l: "All" },
              { v: "public", l: "Public" },
              { v: "community", l: "Community" },
            ]} />
            <FilterGroup label="Speed" value={speed} onChange={setSpeed} options={[
              { v: "all", l: "All" },
              { v: "fast", l: "Fast Charger" },
              { v: "slow", l: "Slow Charger" },
            ]} />
            <FilterGroup label="Connector" value={connector} onChange={setConnector} options={[
              { v: "all", l: "All" },
              { v: "CCS2", l: "CCS2" },
              { v: "Type 2", l: "Type 2" },
              { v: "CHAdeMO", l: "CHAdeMO" },
            ]} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold">Nearby stations</h3>
          <p className="text-xs text-muted-foreground">{filtered.length} results</p>
          <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto pr-1">
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
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    c.source === "public" ? "bg-primary/15 text-primary" :
                    c.source === "community" ? "bg-sky-100 text-sky-700" : "bg-amber-100 text-amber-700"
                  }`}>{c.source}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span>{c.powerKw} kW · {c.speed === "fast" ? "Fast" : "Slow"}</span>
                  <span className={c.available ? "font-medium text-primary" : "font-medium text-orange-500"}>
                    {c.available ? "Available" : "Busy"}
                  </span>
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
      </aside>

      {/* Map */}
      <div className="h-[70vh] min-h-[500px] lg:h-[calc(100vh-8rem)]">
        <ClientOnly fallback={<div className="grid h-full place-items-center rounded-2xl border border-border bg-muted/30 text-sm text-muted-foreground">Loading map…</div>}>
          <ChargerMap chargers={filtered} selectedId={selectedId} />
        </ClientOnly>
      </div>
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

// silence unused import in some bundlers
void Link;