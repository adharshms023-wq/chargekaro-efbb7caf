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
import { Button } from "@/components/ui/button";
import { SupportSection } from "@/components/SupportSection";
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
              Never run out of charge{