import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Upload, Check, Lock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useChargers } from "@/lib/chargers-store";
import type { ConnectorType, Facility, PayhipMode } from "@/data/chargers";

export const Route = createFileRoute("/list")({
  head: () => ({
    meta: [
      { title: "List Your Charger — ChargeShare" },
      { name: "description", content: "Share your home or business EV charger and get paid via Payhip." },
      { property: "og:title", content: "List Your Charger — ChargeShare" },
      { property: "og:description", content: "Share your home or business EV charger with the ChargeShare community." },
    ],
  }),
  component: ListCharger,
});

const CONNECTORS: ConnectorType[] = ["CCS2", "Type 2", "CHAdeMO", "Bharat AC", "Bharat DC"];
const FACILITIES: Facility[] = ["Restroom", "Cafe", "Wi-Fi", "Parking", "Shopping", "Restaurant", "Lounge"];

function ListCharger() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { refresh } = useChargers();

  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>(["Parking"]);
  const [rules, setRules] = useState("No overnight parking\nBring your own cable");
  const [form, setForm] = useState({
    name: "",
    ownerName: "",
    phone: "",
    address: "",
    city: "Kochi",
    lat: "9.9989",
    lng: "76.2986",
    connector: "Type 2" as ConnectorType,
    speed: "slow" as "fast" | "slow",
    powerKw: "7.4",
    pricePerKwh: "12",
    description: "",
    scheduleStart: "18:00",
    scheduleEnd: "08:00",
    image: "",
    payhipUrl: "",
    payhipMode: "pwyw" as PayhipMode,
  });

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleFacility = (f: Facility) =>
    setFacilities((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));

  useEffect(() => {
    if (!loading && !user) {
      // stay on page and show the sign-in prompt
    }
  }, [user, loading]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      const { error } = await supabase.from("chargers").insert({
        owner_id: user.id,
        name: form.name || "Community Charger",
        owner_name: form.ownerName || null,
        phone: form.phone || null,
        source: "community",
        address: form.address,
        city: form.city,
        lat: parseFloat(form.lat) || 10,
        lng: parseFloat(form.lng) || 76.5,
        speed: form.speed,
        power_kw: parseFloat(form.powerKw) || 7.4,
        connectors: [form.connector],
        price_per_kwh: parseFloat(form.pricePerKwh) || 0,
        hours: `${form.scheduleStart} - ${form.scheduleEnd}`,
        description: form.description || "Community charger.",
        image: form.image || null,
        facilities,
        rules,
        payhip_product_url: form.payhipUrl || null,
        payhip_mode: form.payhipUrl ? form.payhipMode : null,
        is_published: true,
      });
      if (error) throw error;
      setSaved(true);
      await refresh();
      setTimeout(() => navigate({ to: "/dashboard" }), 900);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save charger");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Sign in to list a charger</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Hosts need an account so we can attribute earnings and let you manage your listings.
        </p>
        <Link
          to="/auth"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Sign in or create an account
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">List your charger</h1>
        <p className="mt-2 text-muted-foreground">
          Add your home or business charger to the community map. Drivers pay you through your Payhip product link.
        </p>
      </div>
      <form onSubmit={submit} className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <Section title="Basic info">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Charger name"><input required value={form.name} onChange={(e) => update("name", e.target.value)} className={input} placeholder="e.g. Home Wallbox" /></Field>
            <Field label="Owner name"><input value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)} className={input} /></Field>
            <Field label="Phone number"><input value={form.phone} onChange={(e) => update("phone", e.target.value)} className={input} placeholder="+91" /></Field>
            <Field label="City"><input value={form.city} onChange={(e) => update("city", e.target.value)} className={input} /></Field>
            <Field label="Address" full><input required value={form.address} onChange={(e) => update("address", e.target.value)} className={input} /></Field>
            <Field label="Latitude"><input value={form.lat} onChange={(e) => update("lat", e.target.value)} className={input} /></Field>
            <Field label="Longitude"><input value={form.lng} onChange={(e) => update("lng", e.target.value)} className={input} /></Field>
            <Field label="Cover image URL" full>
              <input value={form.image} onChange={(e) => update("image", e.target.value)} className={input} placeholder="https://…" />
            </Field>
          </div>
        </Section>

        <Section title="Charger details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Connector">
              <select value={form.connector} onChange={(e) => update("connector", e.target.value as ConnectorType)} className={input}>
                {CONNECTORS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Charging speed">
              <select value={form.speed} onChange={(e) => update("speed", e.target.value as "fast" | "slow")} className={input}>
                <option value="slow">Slow (AC)</option>
                <option value="fast">Fast (DC)</option>
              </select>
            </Field>
            <Field label="Power (kW)"><input value={form.powerKw} onChange={(e) => update("powerKw", e.target.value)} className={input} /></Field>
            <Field label="Price per kWh (₹)"><input value={form.pricePerKwh} onChange={(e) => update("pricePerKwh", e.target.value)} className={input} /></Field>
            <Field label="Available from"><input type="time" value={form.scheduleStart} onChange={(e) => update("scheduleStart", e.target.value)} className={input} /></Field>
            <Field label="Available till"><input type="time" value={form.scheduleEnd} onChange={(e) => update("scheduleEnd", e.target.value)} className={input} /></Field>
            <Field label="Description" full>
              <textarea rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} className={`${input} py-2`} />
            </Field>
          </div>
        </Section>

        <Section title="Payment (Payhip)">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Payhip product URL" full>
              <input value={form.payhipUrl} onChange={(e) => update("payhipUrl", e.target.value)} className={input} placeholder="https://payhip.com/b/XXXX" />
            </Field>
            <Field label="Payment mode">
              <select value={form.payhipMode} onChange={(e) => update("payhipMode", e.target.value as PayhipMode)} className={input}>
                <option value="pwyw">Pay-what-you-want (metered)</option>
                <option value="fixed">Fixed price (upfront)</option>
              </select>
            </Field>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Create a product on payhip.com and paste its checkout link here. Drivers will be sent to Payhip to pay you directly.
            Choose "Pay-what-you-want" so metered sessions can pay the exact kWh amount.
          </p>
        </Section>

        <Section title="Amenities">
          <div className="flex flex-wrap gap-2">
            {FACILITIES.map((f) => (
              <button type="button" key={f} onClick={() => toggleFacility(f)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  facilities.includes(f) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted"
                }`}>
                {f}
              </button>
            ))}
          </div>
        </Section>

        <Section title="House rules">
          <textarea rows={4} value={rules} onChange={(e) => setRules(e.target.value)}
            placeholder="One rule per line"
            className={`${input} h-auto py-2`} />
          <p className="mt-1 text-[11px] text-muted-foreground">One rule per line. Shown to drivers before they arrive.</p>
        </Section>

        <Section title="Photos">
          <label className="flex cursor-not-allowed flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background p-8 text-center opacity-70">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <div className="mt-2 text-sm font-medium">Paste an image URL above</div>
            <div className="text-xs text-muted-foreground">File uploads coming soon</div>
          </label>
        </Section>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-[1.01] disabled:opacity-60"
        >
          {saved ? <><Check className="h-4 w-4" /> Added! Redirecting…</> : busy ? "Saving…" : "Publish charger"}
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
