import { useState } from "react";
import { Navigation2, Route, Battery, Clock, ExternalLink, MapPin } from "lucide-react";
import type { Charger } from "@/data/chargers";
import { haversineKm, USER_LOCATION } from "@/data/chargers";

interface Props {
  charger: Charger;
}

export function RoutePlanner({ charger }: Props) {
  const [batteryRange, setBatteryRange] = useState(280); // km on full charge
  const [currentPct, setCurrentPct] = useState(60);

  const distance = haversineKm(USER_LOCATION, [charger.lat, charger.lng]);
  const avgSpeed = 40; // km/h in city
  const travelMins = Math.round((distance / avgSpeed) * 60);
  const pctNeeded = Math.min(100, Math.ceil((distance / batteryRange) * 100));
  const canReach = currentPct >= pctNeeded + 5;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
          <Route className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold">Route planner</div>
          <div className="text-xs text-muted-foreground">From your location to {charger.name}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat icon={MapPin} label="Distance" value={`${distance.toFixed(1)} km`} />
        <Stat icon={Clock} label="Travel" value={`${travelMins} min`} />
        <Stat icon={Battery} label="Battery need" value={`${pctNeeded}%`} />
      </div>

      <div className="mt-4 space-y-3 rounded-xl border border-border bg-background p-3">
        <div>
          <label className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Current battery</span>
            <span className="font-semibold text-foreground">{currentPct}%</span>
          </label>
          <input
            type="range" min={0} max={100} value={currentPct}
            onChange={(e) => setCurrentPct(parseInt(e.target.value))}
            className="mt-1 w-full accent-primary"
          />
        </div>
        <div>
          <label className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Full range (km)</span>
            <span className="font-semibold text-foreground">{batteryRange} km</span>
          </label>
          <input
            type="range" min={100} max={600} step={10} value={batteryRange}
            onChange={(e) => setBatteryRange(parseInt(e.target.value))}
            className="mt-1 w-full accent-primary"
          />
        </div>
      </div>

      <div className={`mt-3 rounded-xl px-3 py-2 text-xs font-medium ${
        canReach ? "bg-primary/10 text-primary" : "bg-orange-100 text-orange-700"
      }`}>
        {canReach
          ? `You can reach this charger with ~${currentPct - pctNeeded}% to spare.`
          : `You may not reach — need ${pctNeeded + 5}% battery for a safe trip.`}
      </div>

      {/* Route preview (mock) */}
      <svg viewBox="0 0 300 60" className="mt-3 h-14 w-full">
        <line x1="10" y1="40" x2="290" y2="40" stroke="#E5E7EB" strokeWidth="4" strokeDasharray="6 4" />
        <circle cx="10" cy="40" r="6" fill="#22C55E" />
        <circle cx="290" cy="40" r="6" fill="#0F172A" />
        <text x="10" y="20" fontSize="9" fill="#64748B">You</text>
        <text x="260" y="20" fontSize="9" fill="#64748B">Charger</text>
      </svg>

      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${charger.lat},${charger.lng}`}
        target="_blank" rel="noreferrer"
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20"
      >
        <Navigation2 className="h-4 w-4" /> Open in Google Maps <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-2 text-center">
      <Icon className="mx-auto h-3.5 w-3.5 text-primary" />
      <div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-xs font-semibold">{value}</div>
    </div>
  );
}