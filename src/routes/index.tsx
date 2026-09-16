import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  BatteryCharging,
  Check,
  CircleDollarSign,
  Clock3,
  Gauge,
  LocateFixed,
  MapPin,
  Navigation2,
  PlugZap,
  Route as RouteIcon,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Zap,
} from "lucide-react";
import { SupportSection } from "@/components/SupportSection";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useStations } from "@/lib/stations-store";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Plan EV Routes & Charging Stops | ChargeKaro" },
      {
        name: "description",
        content:
          "Plan EV journeys across India and find charging stations along your route. Compare connectors, speed, availability and pricing before you drive.",
      },
      { property: "og:title", content: "Plan EV Routes & Charging Stops | ChargeKaro" },
      {
        property: "og:description",
        content: "Enter your journey and find the right EV charging stops along the way with ChargeKaro.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  const navigate = useNavigate();
  const { stations } = useStations();
  const { coords, status, error: locationError, request: requestLocation } = useGeolocation();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (coords) setFrom("Current location");
  }, [coords]);

  const stationCount = stations.length;
  const operatorCount = new Set(stations.map((station) => station.provider).filter(Boolean)).size;
  const connectorCount = new Set(stations.flatMap((station) => station.connectors)).size;

  const onPlanRoute = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (!from.trim() || !to.trim()) return;

    sessionStorage.setItem(
      "chargekaro-planned-route",
      JSON.stringify({
        from: from.trim(),
        to: to.trim(),
        origin: coords ? { lat: coords.lat, lng: coords.lng } : null,
      }),
    );
    navigate({ to: "/stations", search: { q: to.trim() } });
  };

  const swapStops = () => {
    setFrom(to);
    setTo(from);
    setSubmitted(false);
  };

  return (
    <main className="overflow-hidden bg-background">
      <section className="route-hero relative border-b border-border/60">
        <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1.03fr)_minmax(440px,0.97fr)] lg:gap-16 lg:py-20">
          <div className="relative z-10 min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> India’s route-first EV companion
            </div>

            <h1 className="mt-5 max-w-3xl text-[2.55rem] font-black leading-[1.02] sm:text-6xl lg:text-7xl">
              Never run out of charge <span className="route-gradient-text">on the way.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Plan the journey, not just the next stop. ChargeKaro finds compatible charging stations along your route and near your destination.
            </p>

            <form onSubmit={onPlanRoute} className="mt-7 rounded-2xl border border-border/80 bg-card/95 p-3 shadow-2xl shadow-primary/10 backdrop-blur-xl sm:p-4">
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
                <TripInput
                  id="trip-from"
                  label="From"
                  value={from}
                  placeholder="Your starting point"
                  icon="origin"
                  invalid={submitted && !from.trim()}
                  onChange={setFrom}
                >
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={requestLocation}
                    disabled={status === "locating"}
                    aria-label="Use my current location"
                    title="Use my location"
                    className="h-10 w-10 shrink-0 rounded-xl text-primary hover:bg-primary/10"
                  >
                    <LocateFixed className={status === "locating" ? "animate-spin" : ""} />
                  </Button>
                </TripInput>

                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={swapStops}
                  aria-label="Swap starting point and destination"
                  title="Swap stops"
                  className="mx-auto h-9 w-9 rotate-90 rounded-full border-border bg-card sm:rotate-0"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <TripInput
                  id="trip-to"
                  label="To"
                  value={to}
                  placeholder="Where are you going?"
                  icon="destination"
                  invalid={submitted && !to.trim()}
                  onChange={setTo}
                />
              </div>

              {(locationError || (submitted && (!from.trim() || !to.trim()))) && (
                <p role="alert" className="mt-3 text-xs font-medium text-destructive">
                  {locationError ?? "Enter both your starting point and destination to plan the route."}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="mt-3 h-12 w-full rounded-xl font-bold shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <RouteIcon className="h-5 w-5" /> Plan my route <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> No sign-up needed</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Connector-aware stops</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> India-wide coverage</span>
            </div>
          </div>

          <RoutePreview />
        </div>
      </section>

      <section aria-label="ChargeKaro network statistics" className="border-b border-border/60 bg-card/60">
        <div className="mx-auto grid max-w-6xl grid-cols-2 px-4 sm:grid-cols-4 sm:px-6">
          {[
            { value: stationCount ? `${stationCount}+` : "Growing", label: "stations mapped" },
            { value: operatorCount ? `${operatorCount}+` : "Many", label: "charging networks" },
            { value: connectorCount ? `${connectorCount}` : "5", label: "connector types" },
            { value: "India", label: "built for every route" },
          ].map((stat) => (
            <div key={stat.label} className="border-border/60 px-3 py-5 text-center even:border-l sm:border-l sm:px-6 sm:py-7 sm:first:border-l-0">
              <p className="text-xl font-black text-foreground sm:text-2xl">{stat.value}</p>
              <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionHeading eyebrow="A calmer way to travel" title="From route to reliable charging in three steps" description="ChargeKaro keeps the decisions simple while giving you the details that matter before you leave." />
        <div className="relative mt-10 grid gap-4 md:grid-cols-3 md:gap-6">
          <div aria-hidden className="absolute left-[17%] right-[17%] top-10 hidden border-t border-dashed border-primary/40 md:block" />
          {[
            { icon: RouteIcon, title: "Enter your route", description: "Add your starting point and destination, or use your live location." },
            { icon: MapPin, title: "Find the right stops", description: "See charging stations near your path and around your destination." },
            { icon: BatteryCharging, title: "Charge with confidence", description: "Compare availability, plug type, speed and pricing before you arrive." },
          ].map((step, index) => (
            <article key={step.title} className="relative border-t border-border bg-background pt-6 md:border-t-0 md:pt-0">
              <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border border-primary/30 bg-background shadow-lg shadow-primary/10">
                <span className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-black text-primary-foreground">{index + 1}</span>
                <step.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-5 text-xl font-bold">{step.title}</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-foreground text-background dark:bg-card dark:text-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase text-primary"><Zap className="h-4 w-4" /> Built for the road</div>
            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">A route planner with charging intelligence.</h2>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-background/65 dark:text-muted-foreground sm:text-base">
              Nearby is not always useful. We focus on stations that make sense for where you are actually going.
            </p>
            <Link to="/stations" search={{ q: undefined }} className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
              Explore the station map <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-px overflow-hidden rounded-lg border border-background/15 bg-background/15 dark:border-border dark:bg-border sm:grid-cols-2">
            {[
              { icon: RouteIcon, title: "Route-based discovery", text: "Find useful stops along the drive, not a random list around you." },
              { icon: Clock3, title: "Availability signals", text: "Check station status and recent driver updates before detouring." },
              { icon: PlugZap, title: "Connector matching", text: "Narrow results to the plug types compatible with your EV." },
              { icon: Gauge, title: "Charging speed filters", text: "Compare AC, DC and high-power options for the time you have." },
              { icon: CircleDollarSign, title: "Pricing clarity", text: "Review available pricing details before selecting a stop." },
              { icon: SlidersHorizontal, title: "Trip-ready filters", text: "Balance distance, charging speed and convenience in one view." },
            ].map((feature) => (
              <article key={feature.title} className="bg-foreground p-5 dark:bg-card sm:p-6">
                <feature.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-4 font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-background/60 dark:text-muted-foreground">{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="relative overflow-hidden rounded-lg border border-primary/30 bg-primary/10 px-5 py-10 text-center sm:px-10 sm:py-14">
          <div aria-hidden className="route-grid absolute inset-0 opacity-40" />
          <div className="relative mx-auto max-w-2xl">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground"><Navigation2 className="h-5 w-5" /></span>
            <h2 className="mt-5 text-3xl font-black sm:text-5xl">Ready for your next electric drive?</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">Plan a route now, or sign in to save stations and contribute updates for other EV drivers.</p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-xl px-6 font-bold">
                <a href="#top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><RouteIcon /> Plan a route</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-xl px-6 font-bold">
                <Link to="/auth"><ShieldCheck /> Sign in to ChargeKaro</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SupportSection />
    </main>
  );
}

function TripInput({
  id,
  label,
  value,
  placeholder,
  icon,
  invalid,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  icon: "origin" | "destination";
  invalid: boolean;
  onChange: (value: string) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className={`group grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border bg-background px-3 py-2 transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 ${invalid ? "border-destructive" : "border-border"}`}>
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${icon === "origin" ? "bg-secondary/15 text-secondary" : "bg-primary/15 text-primary"}`}>
        {icon === "origin" ? <Navigation2 className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
      </span>
      <label htmlFor={id} className="min-w-0">
        <span className="block text-[10px] font-bold uppercase text-muted-foreground">{label}</span>
        <input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-invalid={invalid}
          className="mt-0.5 w-full min-w-0 border-0 bg-transparent p-0 text-sm font-semibold shadow-none outline-none placeholder:font-normal placeholder:text-muted-foreground/70 focus:outline-none"
        />
      </label>
      {children ?? <span className="h-10 w-1" />}
    </div>
  );
}

function RoutePreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl" aria-label="Illustrated electric vehicle route from Bengaluru to Goa with charging stops">
      <div className="route-grid absolute inset-[8%] rounded-full opacity-60" aria-hidden />
      <div className="relative aspect-[4/3] min-h-[330px] sm:min-h-[430px]">
        <svg viewBox="0 0 560 430" className="absolute inset-0 h-full w-full text-primary" aria-hidden>
          <path d="M65 340 C95 250 175 325 220 235 S350 205 390 125 S470 150 505 65" fill="none" stroke="currentColor" strokeWidth="18" strokeLinecap="round" opacity=".08" />
          <path className="route-path" d="M65 340 C95 250 175 325 220 235 S350 205 390 125 S470 150 505 65" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="10 12" />
        </svg>

        <RoutePoint className="left-[5%] top-[73%]" label="Bengaluru" sublabel="Start" tone="secondary" />
        <RoutePoint className="right-[2%] top-[4%]" label="Goa" sublabel="Destination" tone="primary" />

        <div className="route-float absolute left-[34%] top-[43%] rounded-lg border border-border bg-card p-3 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground"><Zap className="h-5 w-5" /></span>
            <div><p className="text-xs font-bold">Charge stop 1</p><p className="text-[10px] text-muted-foreground">CCS2 · 60 kW · Available</p></div>
          </div>
        </div>

        <div className="route-float-delayed absolute right-[13%] top-[26%] rounded-lg border border-border bg-card p-3 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-accent/20 text-accent"><BatteryCharging className="h-5 w-5" /></span>
            <div><p className="text-xs font-bold">Charge stop 2</p><p className="text-[10px] text-muted-foreground">DC fast · 2 ports</p></div>
          </div>
        </div>

        <div className="absolute bottom-[2%] right-[7%] grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border shadow-lg">
          <PreviewStat value="583 km" label="Route" />
          <PreviewStat value="2 stops" label="Charging" />
          <PreviewStat value="8h 40m" label="Drive" />
        </div>
      </div>
    </div>
  );
}

function RoutePoint({ className, label, sublabel, tone }: { className: string; label: string; sublabel: string; tone: "primary" | "secondary" }) {
  return (
    <div className={`absolute ${className} flex items-center gap-2`}>
      <span className={`route-pulse grid h-11 w-11 place-items-center rounded-full border-4 border-background shadow-lg ${tone === "primary" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}><MapPin className="h-5 w-5" /></span>
      <span><span className="block text-[10px] text-muted-foreground">{sublabel}</span><span className="block text-xs font-black">{label}</span></span>
    </div>
  );
}

function PreviewStat({ value, label }: { value: string; label: string }) {
  return <div className="bg-card px-3 py-2 text-center"><p className="text-xs font-black">{value}</p><p className="text-[9px] text-muted-foreground">{label}</p></div>;
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-bold uppercase text-primary">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">{title}</h2>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
    </div>
  );
}
