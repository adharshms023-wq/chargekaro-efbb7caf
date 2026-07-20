import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BarChart3, Bookmark, IndianRupee, Users, Zap, ArrowUpRight, Star,
  MessageSquare, Activity,
} from "lucide-react";
import { useChargers } from "@/lib/chargers-store";
import { useFavorites } from "@/lib/favorites";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Host Dashboard — ChargeShare" },
      { name: "description", content: "Business dashboard for EV charger hosts: analytics, bookmarks, earnings and feedback." },
      { property: "og:title", content: "Host Dashboard — ChargeShare" },
      { property: "og:description", content: "Business dashboard for EV charger hosts." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { chargers } = useChargers();
  const { favorites } = useFavorites();
  const myChargers = chargers.filter((c) => c.source === "community").slice(0, 3);

  const stats = [
    { icon: Users, label: "Visitors this month", value: "1,248", trend: "+18%" },
    { icon: Zap, label: "kWh delivered", value: "3,420", trend: "+9%" },
    { icon: IndianRupee, label: "Est. earnings", value: "₹41,040", trend: "+12%" },
    { icon: Bookmark, label: "Bookmarks", value: String(favorites.length || 84) },
  ];

  const feedback = [
    { author: "Priya", rating: 5, comment: "Super clean, easy access, host was friendly." },
    { author: "Anand", rating: 4, comment: "Charger worked well, but signage could improve." },
    { author: "Kiran", rating: 5, comment: "Fastest 60kW in the area. Will return." },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <BarChart3 className="h-3.5 w-3.5" /> HOST DASHBOARD
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Welcome back 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">Snapshot of your chargers, earnings and community feedback.</p>
        </div>
        <Link to="/list" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20">
          + Add another charger
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-4 w-4" />
              </div>
              {s.trend && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <ArrowUpRight className="h-3 w-3" /> {s.trend}
                </span>
              )}
            </div>
            <div className="mt-3 text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Chargers */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your chargers</h2>
              <span className="text-xs text-muted-foreground">{myChargers.length} active</span>
            </div>
            <div className="mt-4 space-y-3">
              {myChargers.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                  <img src={c.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{c.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{c.address}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <span className={`inline-flex items-center gap-1 font-semibold ${c.available ? "text-emerald-600" : "text-orange-500"}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {c.available ? "Online" : "Busy"}
                      </span>
                      <span className="text-muted-foreground">· ₹{c.pricePerKwh}/kWh · {c.powerKw} kW</span>
                    </div>
                  </div>
                  <Link to="/charger/$id" params={{ id: c.id }} className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold">Manage</Link>
                </div>
              ))}
              {myChargers.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  You haven't listed a charger yet. <Link to="/list" className="text-primary underline">List one →</Link>
                </div>
              )}
            </div>
          </div>

          {/* Mock chart */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Weekly sessions</h2>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Activity className="h-3.5 w-3.5" /> Last 7 days</span>
            </div>
            <svg viewBox="0 0 320 120" className="mt-4 h-32 w-full">
              {[14, 22, 18, 30, 26, 40, 34].map((v, i) => (
                <g key={i}>
                  <rect x={20 + i * 42} y={110 - v * 2.2} width="26" height={v * 2.2} rx="4" fill="url(#g)" />
                </g>
              ))}
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#22C55E" />
                  <stop offset="1" stopColor="#16A34A" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <text key={i} x={33 + i * 42} y={118} fontSize="9" textAnchor="middle" fill="#94A3B8">{d}</text>
              ))}
            </svg>
          </div>
        </div>

        {/* Feedback */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Customer feedback</h2>
            </div>
            <div className="mt-3 space-y-3">
              {feedback.map((f, i) => (
                <div key={i} className="rounded-xl border border-border bg-background p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">{f.author}</div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: f.rating }).map((_, k) => <Star key={k} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{f.comment}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-5">
            <div className="text-xs font-bold uppercase tracking-wide text-primary">Pro tip</div>
            <p className="mt-2 text-sm">Enable "Ports available" live updates during off-peak hours to attract 30% more sessions.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}