import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  Zap, MapPin, Users, Building2, Search, ListPlus, Navigation2, Sparkles,
  ArrowRight, Star, Radio, Newspaper, Handshake, Compass, ShieldCheck, Clock,
} from "lucide-react";
import { useChargers } from "@/lib/chargers-store";
import { useLiveUpdates, timeAgo, KIND_LABEL } from "@/lib/live-updates";
import { chargerStatus, defaultPorts, haversineKm, USER_LOCATION } from "@/data/chargers";
import { news, brands, popularCities } from "@/data/news";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "ChargeKaro — Find EV Charging Stations Across Kerala" },
      {
        name: "description",
        content:
          "Discover public and community EV charging stations across Kerala. Live driver updates, transparent pricing, connector filters and one-tap navigation.",
      },
      { property: "og:title", content: "ChargeKaro — Find EV Charging Stations Across Kerala" },
      {
        property: "og:description",
        content: "Find, compare and navigate to EV chargers near you — public stations, private hosts and EV-friendly places.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  const { chargers } = useChargers();
  const { updates } = useLiveUpdates();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const communityCount = chargers.filter((c) => c.source === "community").length;
  const cityCount = new Set(chargers.map((c) => c.city)).size;

  const nearby = [...chargers]
    .map((c) => ({ c, dist: haversineKm(USER_LOCATION, [c.lat, c.lng]) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 6)
    .map((x) => ({ ...x.c, _dist: x.dist } as typeof chargers[number] & { _dist: number }));

  const featured = chargers.filter((c) => c.rating >= 4.7).slice(0, 3);
  const community = chargers.filter((c) => c.source === "community").slice(0, 4);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate({ to: "/stations", search: { q: query.trim() || undefined } });
  };

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl sm:h-96 sm:w-96" />
          <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-secondary/15 blur-3xl sm:h-96 sm:w-96" />
        </div>
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:py-16 lg:grid-cols-2 lg:gap-12 lg:py-24">
          <div className="flex flex-col animate-fade-in">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary sm:text-xs">
              <Sparkles className="h-3.5 w-3.5 shrink-0" /> Find → Compare → Navigate → Charge
            </div>
            <h1 className="mt-4 text-[2rem] font-extrabold leading-[1.1] tracking-tight text-foreground sm:mt-5 sm:text-5xl lg:text-6xl">
              Find EV charging stations{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                anywhere in Kerala
              </span>
            </h1>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
              Public stations, private hosts and EV-friendly places — with live driver updates, smart routing and transparent pricing.
            </p>

            {/* Hero search */}
            <form
              onSubmit={onSearch}
              className="mt-6 flex items-center gap-2 rounded-2xl border border-border bg-card p-1.5 shadow-lg shadow-primary/10 sm:mt-7 sm:rounded-full"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2 pl-3 sm:pl-4">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search charging stations"
                  placeholder="Search city, provider or connector"
                  className="w-full min-w-0 bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground/80"
                />
              </div>
              <button
                type="submit"
                className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-95 sm:rounded-full sm:px-5"
              >
                <span className="hidden sm:inline">Search</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <Link to="/community" className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 font-semibold text-primary">
                <Radio className="h-3 w-3 animate-pulse" /> {updates.length} live updates
              </Link>
              <Link to="/list" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 font-medium">
                <ListPlus className="h-3 w-3" /> Become a host
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 font-medium text-muted-foreground">
                <ShieldCheck className="h-3 w-3" /> Verified listings
              </span>
            </div>
          </div>

          <div className="relative order-first mx-auto w-full max-w-sm lg:order-none lg:max-w-none">
            <EvIllustration />
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: MapPin, label: "Stations near me", to: "/stations" as const },
            { icon: Navigation2, label: "Explore map", to: "/explore" as const },
            { icon: Radio, label: "Live feed", to: "/community" as const },
            { icon: ListPlus, label: "List a charger", to: "/list" as const },
          ].map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className="flex items-center gap-2.5 rounded-2xl border border-border bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md sm:flex-col sm:items-start sm:gap-3 sm:p-4"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <a.icon className="h-4.5 w-4.5" />
              </span>
              <span className="min-w-0 text-[13px] font-semibold leading-tight sm:text-sm">{a.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto mt-4 grid max-w-6xl grid-cols-2 gap-3 px-4 sm:gap-4 lg:grid-cols-4">
        {[
          { icon: Zap, label: "Chargers", value: chargers.length },
          { icon: Users, label: "Community hosts", value: communityCount },
          { icon: Building2, label: "Cities", value: cityCount },
          { icon: Radio, label: "Live now", value: updates.length },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-transform hover:-translate-y-1 sm:p-5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary sm:h-10 sm:w-10">
              <s.icon className="h-5 w-5" />
            </div>
            <div className="mt-3 text-2xl font-bold sm:text-3xl">{s.value}</div>
            <div className="text-xs text-muted-foreground sm:text-sm">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Featured chargers */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <SectionHeader eyebrow="Featured" title="Top-rated chargers this month" link={{ to: "/explore", label: "See all" }} />
        <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((c) => (
            <FeaturedCard key={c.id} c={c} />
          ))}
        </div>
      </section>

      {/* Nearby chargers */}
      <section className="bg-muted/30 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeader eyebrow="Near you" title="Chargers around your location" link={{ to: "/stations", label: "Open map" }} />
          <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {nearby.map((c) => (
              <NearbyCard key={c.id} c={c} dist={c._dist} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular cities */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <SectionHeader eyebrow="Explore India" title="Popular EV cities" />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-3 lg:grid-cols-6">
          {popularCities.map((c) => (
            <Link
              key={c.name}
              to="/explore"
              className="group rounded-2xl border border-border bg-card p-3.5 transition-all hover:-translate-y-1 hover:shadow-md sm:p-4"
            >
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary sm:h-10 sm:w-10">
                <Compass className="h-5 w-5" />
              </div>
              <div className="mt-3 truncate text-sm font-semibold">{c.name}</div>
              <div className="truncate text-xs text-muted-foreground">{c.chargers}+ chargers · {c.state}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Community chargers */}
      {community.length > 0 && (
        <section className="relative overflow-hidden py-12 sm:py-16">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeader eyebrow="Community" title="Private hosts open to travelers" link={{ to: "/list", label: "Become a host" }} />
            <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-4">
              {community.map((c) => (
                <Link
                  key={c.id}
                  to="/charger/$id"
                  params={{ id: c.id }}
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    <span className="absolute left-2 top-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase text-secondary-foreground">Private</span>
                  </div>
                  <div className="p-3 sm:p-4">
                    <div className="truncate text-sm font-semibold">{c.name}</div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">Hosted by {c.ownerName ?? "Community"}</div>
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                      <span className="truncate text-muted-foreground">₹{c.pricePerKwh}/kWh · {c.powerKw}kW</span>
                      <span className="inline-flex shrink-0 items-center gap-0.5"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{c.rating}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Live community feed teaser */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:pb-16">
        <div className="grid gap-5 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6 lg:grid-cols-[1fr_360px] lg:p-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary sm:text-xs">
              <Radio className="h-3.5 w-3.5 animate-pulse" /> CHARGE TOGETHER
            </div>
            <h3 className="mt-3 text-xl font-bold tracking-tight sm:text-3xl">Live updates from drivers, right now</h3>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              “No queue”, “2 ports open”, “Station offline” — a real-time community pulse. Posts expire in a few hours so info stays fresh.
            </p>
            <Link to="/community" className="mt-5 inline-flex w-full items-center justify-center gap-1 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground sm:w-auto">
              Open community feed <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {updates.slice(0, 3).map((u) => (
              <div key={u.id} className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wide text-primary">{KIND_LABEL[u.kind]}</div>
                <div className="mt-0.5 text-sm">{u.message}</div>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" /> {u.author} · {timeAgo(u.createdAt)}
                </div>
              </div>
            ))}
            {updates.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                No live updates yet — be the first driver to post one.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">How it works</h2>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">Three simple steps to charge anywhere.</p>
        </div>
        <div className="mt-8 grid gap-5 sm:mt-12 md:grid-cols-3">
          {[
            { icon: Search, title: "Search", desc: "Find chargers around you on an interactive map." },
            { icon: Navigation2, title: "Navigate", desc: "Get directions and details in a single tap." },
            { icon: ListPlus, title: "Share", desc: "Host your own charger and earn from your community." },
          ].map((f, i) => (
            <div key={f.title} className="group relative rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-lg sm:p-6">
              <div className="absolute -top-3 left-5 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground sm:left-6">
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

      {/* News */}
      <section className="bg-muted/30 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeader eyebrow="EV News" title="Latest in Indian EV mobility" />
          <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((n) => (
              <a key={n.id} href={n.url} className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={n.image} alt={n.title} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                    <Newspaper className="h-3 w-3" /> {n.source}
                  </div>
                  <div className="mt-2 text-sm font-semibold">{n.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{n.date}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Partner brands */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <SectionHeader eyebrow="Partners" title="Networks on ChargeKaro" />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-3 lg:grid-cols-6">
          {brands.map((b) => (
            <div key={b.id} className="flex flex-col items-center rounded-2xl border border-border bg-card p-4 text-center transition-transform hover:-translate-y-1 sm:p-5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Handshake className="h-5 w-5" />
              </div>
              <div className="mt-2 text-sm font-semibold">{b.name}</div>
              <div className="text-xs text-muted-foreground">{b.tagline}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:pb-20">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary p-6 text-primary-foreground shadow-2xl shadow-primary/30 sm:p-12">
          <h3 className="text-2xl font-bold tracking-tight sm:text-4xl">Have a charger? Share it. Earn from it.</h3>
          <p className="mt-3 max-w-2xl text-sm text-primary-foreground/90 sm:text-base">
            Turn your driveway wallbox into a community asset. Set your price, hours and rules — we handle discovery.
          </p>
          <Link
            to="/list"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-card px-6 py-3 text-sm font-semibold text-primary shadow-lg sm:w-auto"
          >
            List your charger <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <SupportSection />
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  link,
}: {
  eyebrow: string;
  title: string;
  link?: { to: "/explore" | "/list" | "/stations"; label: string };
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 sm:gap-4">
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-widest text-primary sm:text-xs">{eyebrow}</div>
        <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      </div>
      {link && (
        <Link
          to={link.to}
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted sm:px-4 sm:py-2"
        >
          {link.label} <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

function FeaturedCard({ c }: { c: ReturnType<typeof useChargers>["chargers"][number] }) {
  return (
    <Link
      to="/charger/$id"
      params={{ id: c.id }}
      className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-primary/95 px-2.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground backdrop-blur">Featured</span>
          <span className="rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur">
            {c.source === "community" ? "Private" : c.source === "place" ? "EV-friendly" : "Public"}
          </span>
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-card/95 px-2 py-1 text-xs font-bold shadow">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{c.rating}
        </div>
        <div className="absolute bottom-3 left-3 right-20 text-background dark:text-foreground">
          <div className="truncate text-base font-bold text-white">{c.name}</div>
          <div className="truncate text-xs text-white/90">{c.city}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 p-3 text-xs sm:p-4">
        <Cell label="Power" value={`${c.powerKw}kW`} />
        <Cell label="Price" value={`₹${c.pricePerKwh}`} />
        <Cell label="Ports" value={String(defaultPorts(c))} />
      </div>
    </Link>
  );
}

function NearbyCard({ c, dist }: { c: ReturnType<typeof useChargers>["chargers"][number]; dist: number }) {
  const status = chargerStatus(c);
  return (
    <Link
      to="/charger/$id"
      params={{ id: c.id }}
      className="group flex gap-3 rounded-2xl border border-border bg-card p-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <img src={c.image} alt={c.name} loading="lazy" className="h-20 w-20 shrink-0 rounded-xl object-cover sm:h-24 sm:w-24" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${
              status === "available"
                ? "bg-primary/15 text-primary"
                : status === "busy"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            <span className="h-1 w-1 rounded-full bg-current" /> {status}
          </span>
          <span className="text-[10px] font-medium text-muted-foreground">{dist.toFixed(1)} km</span>
        </div>
        <div className="mt-1 truncate text-sm font-semibold">{c.name}</div>
        <div className="truncate text-xs text-muted-foreground">
          <MapPin className="mr-0.5 inline h-3 w-3" />{c.city}
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2 text-xs">
          <span className="truncate text-muted-foreground">{c.powerKw}kW · ₹{c.pricePerKwh}</span>
          <span className="inline-flex shrink-0 items-center gap-0.5"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{c.rating}</span>
        </div>
      </div>
    </Link>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-2 text-center">
      <div className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-bold">{value}</div>
    </div>
  );
}

function EvIllustration() {
  return (
    <svg viewBox="0 0 500 400" role="img" aria-label="Electric car charging illustration" className="w-full drop-shadow-xl">
      <defs>
        <linearGradient id="body" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#00E676" />
          <stop offset="1" stopColor="#00BCD4" />
        </linearGradient>
        <linearGradient id="ground" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#00E676" stopOpacity="0.22" />
          <stop offset="1" stopColor="#00E676" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="250" cy="360" rx="220" ry="30" fill="url(#ground)" />
      <rect x="60" y="140" width="60" height="180" rx="14" fill="#0D1117" />
      <rect x="72" y="156" width="36" height="50" rx="6" fill="#00E676" />
      <circle cx="90" cy="230" r="5" fill="#00E676" />
      <circle cx="90" cy="250" r="5" fill="#00E676" opacity="0.5" />
      <path d="M120 210 C 160 210, 170 240, 200 240" stroke="#0D1117" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M180 280 L220 220 Q235 205 260 205 L340 205 Q365 205 380 220 L420 280 Z" fill="url(#body)" />
      <rect x="180" y="270" width="240" height="40" rx="14" fill="#00BFA5" />
      <path d="M230 220 L250 250 L300 250 L305 220 Z" fill="#E0F2FE" opacity="0.85" />
      <path d="M310 220 L315 250 L365 250 L375 220 Z" fill="#E0F2FE" opacity="0.85" />
      <circle cx="220" cy="320" r="22" fill="#0D1117" />
      <circle cx="380" cy="320" r="22" fill="#0D1117" />
      <circle cx="220" cy="320" r="9" fill="#64748B" />
      <circle cx="380" cy="320" r="9" fill="#64748B" />
      <path d="M410 90 L390 140 L410 140 L400 180 L440 120 L420 120 L430 90 Z" fill="#FDE047" stroke="#0D1117" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
