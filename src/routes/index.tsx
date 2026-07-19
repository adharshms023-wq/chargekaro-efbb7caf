import { createFileRoute, Link } from "@tanstack/react-router";
import { Zap, MapPin, Users, Building2, Search, ListPlus, Navigation2, Sparkles, ArrowRight } from "lucide-react";
import { useChargers } from "@/lib/chargers-store";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { chargers } = useChargers();
  const communityCount = chargers.filter((c) => c.source === "community").length;
  const cityCount = new Set(chargers.map((c) => c.city)).size;

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-emerald-300/30 blur-3xl" />
        </div>
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center animate-fade-in">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> India's community EV network
            </div>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Find EV Chargers <span className="text-primary">Anywhere</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Discover public charging stations and community chargers near you — plus EV-friendly cafés, hotels and resorts.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105"
              >
                Explore Map <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/list"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold hover:bg-muted"
              >
                List your charger
              </Link>
            </div>
          </div>
          <div className="relative">
            <EvIllustration />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto -mt-4 grid max-w-6xl gap-4 px-4 sm:grid-cols-3">
        {[
          { icon: Zap, label: "Total Chargers", value: chargers.length },
          { icon: Users, label: "Community Hosts", value: communityCount },
          { icon: Building2, label: "Cities Covered", value: cityCount },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-transform hover:-translate-y-1">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <s.icon className="h-5 w-5" />
            </div>
            <div className="mt-4 text-3xl font-bold">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
          <p className="mt-3 text-muted-foreground">Three simple steps to charge anywhere.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: Search, title: "Search", desc: "Find chargers around you on an interactive map." },
            { icon: Navigation2, title: "Navigate", desc: "Get directions and details in a single tap." },
            { icon: ListPlus, title: "Share", desc: "Host your own charger and earn from your community." },
          ].map((f, i) => (
            <div key={f.title} className="group relative rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg">
              <div className="absolute -top-3 left-6 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                Step {i + 1}
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything an EV driver needs</h2>
              <p className="mt-4 text-muted-foreground">
                From fast DC chargers on the highway to a friendly wallbox in your neighborhood, ChargeShare puts every option on one map.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Public & community chargers on one map",
                  "Filter by speed, connector and availability",
                  "EV-friendly cafés, hotels, resorts & malls",
                  "One-tap Google Maps directions",
                ].map((x) => (
                  <li key={x} className="flex items-start gap-2">
                    <span className="mt-1 grid h-4 w-4 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">✓</span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Live availability", soon: true },
                { label: "AI Route Planner", soon: true },
                { label: "Book Charger", soon: true },
                { label: "Ratings & Reviews", soon: true },
              ].map((c) => (
                <div key={c.label} className="rounded-2xl border border-dashed border-border bg-background p-5 opacity-70">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div className="mt-3 font-medium">{c.label}</div>
                  <div className="text-xs text-muted-foreground">Coming soon</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function EvIllustration() {
  return (
    <svg viewBox="0 0 500 400" className="w-full drop-shadow-xl">
      <defs>
        <linearGradient id="body" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#22C55E" />
          <stop offset="1" stopColor="#16A34A" />
        </linearGradient>
        <linearGradient id="ground" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#DCFCE7" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="250" cy="360" rx="220" ry="30" fill="url(#ground)" />
      {/* Charging station */}
      <rect x="60" y="140" width="60" height="180" rx="14" fill="#0F172A" />
      <rect x="72" y="156" width="36" height="50" rx="6" fill="#22C55E" />
      <circle cx="90" cy="230" r="5" fill="#22C55E" />
      <circle cx="90" cy="250" r="5" fill="#22C55E" opacity="0.5" />
      <path d="M120 210 C 160 210, 170 240, 200 240" stroke="#0F172A" strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* Car body */}
      <path d="M180 280 L220 220 Q235 205 260 205 L340 205 Q365 205 380 220 L420 280 Z" fill="url(#body)" />
      <rect x="180" y="270" width="240" height="40" rx="14" fill="#16A34A" />
      <path d="M230 220 L250 250 L300 250 L305 220 Z" fill="#E0F2FE" opacity="0.85" />
      <path d="M310 220 L315 250 L365 250 L375 220 Z" fill="#E0F2FE" opacity="0.85" />
      <circle cx="220" cy="320" r="22" fill="#0F172A" />
      <circle cx="380" cy="320" r="22" fill="#0F172A" />
      <circle cx="220" cy="320" r="9" fill="#64748B" />
      <circle cx="380" cy="320" r="9" fill="#64748B" />
      {/* Bolt */}
      <path d="M410 90 L390 140 L410 140 L400 180 L440 120 L420 120 L430 90 Z" fill="#FDE047" stroke="#0F172A" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
