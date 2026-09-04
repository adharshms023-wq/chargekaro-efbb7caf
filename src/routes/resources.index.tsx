import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Clock, MapPin, PlugZap, Route as RouteIcon } from "lucide-react";
import { resources } from "@/data/resources";

const TITLE = "EV charging guides & resources — ChargeKaro";
const DESCRIPTION =
  "Practical EV charging guides for India: choosing a reliable station, understanding connectors and AC vs DC, planning road trips, charging costs and home setup.";

export const Route = createFileRoute("/resources/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://chargekaro.lovable.app/resources" }],
  }),
  component: ResourcesHub,
});

function ResourcesHub() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        <BookOpen className="h-3.5 w-3.5" /> Resources
      </div>
      <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
        EV charging guides for Indian drivers
      </h1>
      <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
        Straightforward explanations of connectors, charging speeds, pricing and trip planning —
        written so you can make a confident decision before you drive to a station.
      </p>

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link
          to="/stations"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 font-medium hover:bg-muted"
        >
          <MapPin className="h-4 w-4 text-primary" /> Browse the stations directory
        </Link>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 font-medium hover:bg-muted"
        >
          <RouteIcon className="h-4 w-4 text-primary" /> Open the map
        </Link>
        <Link
          to="/list"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 font-medium hover:bg-muted"
        >
          <PlugZap className="h-4 w-4 text-primary" /> List your charger
        </Link>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {resources.map((article) => (
          <article
            key={article.slug}
            className="flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
          >
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
                {article.category}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {article.readTime}
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold leading-snug">
              <Link
                to="/resources/$slug"
                params={{ slug: article.slug }}
                className="hover:text-primary"
              >
                {article.title}
              </Link>
            </h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{article.description}</p>
            <Link
              to="/resources/$slug"
              params={{ slug: article.slug }}
              className="mt-4 text-sm font-medium text-primary hover:underline"
            >
              Read the guide →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
