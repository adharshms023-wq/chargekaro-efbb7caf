import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, Check } from "lucide-react";
import { useChargers } from "@/lib/chargers-store";
import type { Charger, ConnectorType } from "@/data/chargers";

export const Route = createFileRoute("/list")({
  head: () => ({
    meta: [
      { title: "List Your Charger — ChargeShare" },
      { name: "description", content: "Share your home or business EV charger with the ChargeShare community." },
      { property: "og:title", content: "List Your Charger — ChargeShare" },
      { property: "og:description", content: "Share your home or business EV charger with the ChargeShare community." },
    ],
  }),
  component: ListCharger,
});

const CONNECTORS: ConnectorType[] = ["CCS2", "Type 2", "CHAdeMO", "Bharat AC", "Bharat DC"];

function ListCharger() {
  const { addCharger } = useChargers();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: "",
    ownerName: "",
    phone: "",
    address: "",
    city: "Kochi",
    lat: "9.9989",
    lng: "76.2986",
    chargerType: "AC Wallbox",
    connector: "Type 2" as ConnectorType,
    speed: "slow" as "fast" | "slow",
    powerKw: "7.4",
    available: true,
    pricePerKwh: "12",
    description: "",
  });

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `user-${Date.now()}`;
    const c: Charger = {
      id,
      name: form.name || "Community Charger",
      ownerName: form.ownerName,
      phone: form.phone,
      source: "community",
      address: form.address,
      city: form.city,
      lat: parseFloat(form.lat) || 10,
      lng: parseFloat(form.lng) || 76.5,
      chargerType: form.chargerType,
      connectors: [form.connector],
      speed: form.speed,
      powerKw: parseFloat(form.powerKw) || 7.4,
      available: form.available,
      rating: 5,
      hours: "24/7",
      pricePerKwh: parseFloat(form.pricePerKwh) || 12,
      description: form.description || "Community charger.",
      image: "https://images.unsplash.com/photo-1617704548623-340376564e68?auto=format&fit=crop&w=1200&q=70",
    };
    addCharger(c);
    setSaved(true);
    setTimeout(() => navigate({ to: "/explore" }), 900);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">List your charger</h1>
        <p className="mt-2 text-muted-foreground">Add your home or business charger to the community map. It'll appear instantly.</p>
      </div>
      <form onSubmit={submit} className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <Section title="Basic info">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Charger name"><input required value={form.name} onChange={(e) => update("name", e.target.value)} className={input} placeholder="e.g. Home Wallbox" /></Field>
            <Field label="Owner name"><input value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)} className={input} /></Field>
            <Field label="Phone number"><input value={form.phone} onChange={(e) => update("phone", e.target.value)} className={input} placeholder="+91" /></Field>
            <Field label="City"><input value={form.city} onChange={(e) => update("city", e.target.value)} className={input} /></Field>
            <Field label="Address" full><input value={form.address} onChange={(e) => update("address", e.target.value)} className={input} /></Field>
            <Field label="Latitude"><input value={form.lat} onChange={(e) => update("lat", e.target.value)} className={input} /></Field>
            <Field label="Longitude"><input value={form.lng} onChange={(e) => update("lng", e.target.value)} className={input} /></Field>
          </div>
        </Section>

        <Section title="Charger details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Charger type">
              <select value={form.chargerType} onChange={(e) => update("chargerType", e.target.value)} className={input}>
                <option>AC Wallbox</option>
                <option>AC Type 2</option>
                <option>DC Fast</option>
              </select>
            </Field>
            <Field label="Connector">
              <select value={form.connector} onChange={(e) => update("connector", e.target.value as ConnectorType)} className={input}>
                {CONNECTORS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Charging speed">
              <select value={form.speed} onChange={(e) => update("speed", e.target.value as "fast" | "slow")} className={input}>
                <option value="slow">Slow</option>
                <option value="fast">Fast</option>
              </select>
            </Field>
            <Field label="Power (kW)"><input value={form.powerKw} onChange={(e) => update("powerKw", e.target.value)} className={input} /></Field>
            <Field label="Price per kWh (₹)"><input value={form.pricePerKwh} onChange={(e) => update("pricePerKwh", e.target.value)} className={input} /></Field>
            <Field label="Availability">
              <label className="flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm">
                <input type="checkbox" checked={form.available} onChange={(e) => update("available", e.target.checked)} /> Available now
              </label>
            </Field>
            <Field label="Description" full>
              <textarea rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} className={`${input} py-2`} />
            </Field>
          </div>
        </Section>

        <Section title="Photos">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background p-8 text-center hover:bg-muted/40">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <div className="mt-2 text-sm font-medium">Click to upload images</div>
            <div className="text-xs text-muted-foreground">JPG, PNG up to 10 MB (UI only)</div>
            <input type="file" multiple accept="image/*" className="hidden" />
          </label>
        </Section>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-[1.01]"
        >
          {saved ? <><Check className="h-4 w-4" /> Added! Redirecting…</> : "Add to map"}
        </button>
      </form>
    </div>
  );
}

const input = "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}