import { createFileRoute } from "@tanstack/react-router";
import { Zap, Users, MapPin } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — ChargeShare" },
      { name: "description", content: "ChargeShare is a community-driven map of EV chargers across India." },
      { property: "og:title", content: "About — ChargeShare" },
      { property: "og:description", content: "ChargeShare is a community-driven map of EV chargers across India." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        <Zap className="h-3.5 w-3.5" /> About ChargeShare
      </div>
      <h1 className="mt-4 text-4xl font-bold tracking-tight">Powering India's EV community</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        ChargeShare is a community-driven platform that maps every EV charger — public, private, and EV-friendly places — into one delightful experience. We want charging anxiety to disappear.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {[
          { icon: MapPin, title: "One map", desc: "Public stations, community chargers and EV-friendly spots on a single map." },
          { icon: Users, title: "Community first", desc: "Anyone with a home charger can share it and support fellow EV drivers." },
          { icon: Zap, title: "Made for India", desc: "Built with local connectors, tariffs and cities in mind." },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl border border-border bg-card p-6">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <c.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-semibold">{c.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-dashed border-border bg-muted/30 p-6">
        <h2 className="text-lg font-semibold">What's next</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Login accounts, real-time availability, bookings, payments, ratings, chat with hosts, and an AI-powered route planner for road trips.
        </p>
      </div>
    </div>
  );
}