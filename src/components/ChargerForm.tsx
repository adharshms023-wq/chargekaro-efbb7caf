import { useState } from "react";
import { Upload, Check, AlertCircle, MapPin, LocateFixed } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useChargers } from "@/lib/chargers-store";
import type { Charger, ConnectorType, Facility, PayhipMode } from "@/data/chargers";

const CONNECTORS: ConnectorType[] = ["CCS2", "Type 2", "CHAdeMO", "Bharat AC", "Bharat DC"];
const FACILITIES: Facility[] = ["Restroom", "Cafe", "Wi-Fi", "Parking", "Shopping", "Restaurant", "Lounge"];

const input = "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary";

interface Props {
  mode: "create" | "edit";
  ownerId: string;
  chargerId?: string;
  initial?: Charger;
  onDone: () => void;
}

export function ChargerForm({ mode, ownerId, chargerId, initial, onDone }: Props) {
  const { refresh } = useChargers();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapLink, setMapLink] = useState("");
  const [locMsg, setLocMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [locating, setLocating] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>(initial?.facilities ?? ["Parking"]);
  const [rules, setRules] = useState(
    initial?.rules?.join("\n") ?? "No overnight parking\nBring your own cable",
  );

  const parseHours = (h?: string): [string, string] => {
    if (!h) return ["18:00", "08:00"];
    const m = h.split(/\s*-\s*/);
    return [m[0] || "18:00", m[1] || "08:00"];
  };
  const [hStart, hEnd] = parseHours(initial?.hours);

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    ownerName: initial?.ownerName ?? "",
    phone: initial?.phone ?? "",
    address: initial?.address ?? "",
    city: initial?.city ?? "Kochi",
    lat: (initial?.lat ?? 9.9989).toString(),
    lng: (initial?.lng ?? 76.2986).toString(),
    connector: (initial?.connectors?.[0] ?? "Type 2") as ConnectorType,
    speed: (initial?.speed ?? "slow") as "fast" | "slow",
    powerKw: (initial?.powerKw ?? 7.4).toString(),
    pricePerKwh: (initial?.pricePerKwh ?? 12).toString(),
    description: initial?.description ?? "",
    scheduleStart: hStart,
    scheduleEnd: hEnd,
    image: initial?.image ?? "",
    payhipUrl: initial?.payhipUrl ?? "",
    payhipMode: (initial?.payhipMode ?? "pwyw") as PayhipMode,
  });

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleFacility = (f: Facility) =>
    setFacilities((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));

  const setCoords = (lat: number, lng: number, note: string) => {
    update("lat", lat.toFixed(6));
    update("lng", lng.toFixed(6));
    setLocMsg({ tone: "ok", text: note });
  };

  const parseMapLink = (raw: string): { lat: number; lng: number } | null => {
    if (!raw) return null;
    const s = raw.trim();
    const patterns = [
      /@(-?\d+\.\d+),(-?\d+\.\d+)/,
      /[?&](?:q|ll|destination|center)=(-?\d+\.\d+),(-?\d+\.\d+)/,
      /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
      /^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/,
    ];
    for (const re of patterns) {
      const m = s.match(re);
      if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
    }
    return null;
  };

  const applyMapLink = async () => {
    setLocMsg(null);
    let link = mapLink.trim();
    if (!link) return;
    if (/^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(link)) {
      try {
        const r = await fetch(link, { redirect: "follow" });
        link = r.url || link;
      } catch {
        /* ignore */
      }
    }
    const coords = parseMapLink(link);
    if (!coords) {
      setLocMsg({ tone: "err", text: "Couldn't read coordinates from that link. Open the pin in Google Maps → Share → Copy link." });
      return;
    }
    setCoords(coords.lat, coords.lng, "Location set from Google Maps link.");
  };

  const useCurrentLocation = () => {
    setLocMsg(null);
    if (!("geolocation" in navigator)) {
      setLocMsg({ tone: "err", text: "Geolocation not supported on this device." });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords(pos.coords.latitude, pos.coords.longitude, "Location set from your current position.");
        setLocating(false);
      },
      (err) => {
        setLocMsg({ tone: "err", text: err.message || "Couldn't get your location." });
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = {
        name: form.name || "Community Charger",
        owner_name: form.ownerName || null,
        phone: form.phone || null,
        source: "community" as const,
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
      };
      if (mode === "edit" && chargerId) {
        const { error } = await supabase.from("chargers").update(payload).eq("id", chargerId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("chargers").insert({ ...payload, owner_id: ownerId });
        if (error) throw error;
      }
      setSaved(true);
      await refresh();
      setTimeout(onDone, 700);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save charger");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <Section title="Basic info">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Charger name"><input required value={form.name} onChange={(e) => update("name", e.target.value)} className={input} placeholder="e.g. Home Wallbox" /></Field>
          <Field label="Owner name"><input value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)} className={input} /></Field>
          <Field label="Phone number"><input value={form.phone} onChange={(e) => update("phone", e.target.value)} className={input} placeholder="+91" /></Field>
          <Field label="City"><input value={form.city} onChange={(e) => update("city", e.target.value)} className={input} /></Field>
          <Field label="Address" full><input required value={form.address} onChange={(e) => update("address", e.target.value)} className={input} /></Field>
          <Field label="Cover image URL" full>
            <input value={form.image} onChange={(e) => update("image", e.target.value)} className={input} placeholder="https://…" />
          </Field>
        </div>

        <div className="mt-5 rounded-xl border border-border bg-background/60 p-4">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">Pin your location</div>
              <div className="text-[11px] text-muted-foreground">
                Paste a Google Maps link (Share → Copy link) or use your current location.
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={mapLink}
              onChange={(e) => setMapLink(e.target.value)}
              placeholder="https://maps.app.goo.gl/…  or  9.9989, 76.2986"
              className={input}
            />
            <button type="button" onClick={applyMapLink} className="h-10 shrink-0 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Use link</button>
            <button type="button" onClick={useCurrentLocation} disabled={locating} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-medium hover:bg-muted disabled:opacity-60">
              <LocateFixed className="h-4 w-4" />
              {locating ? "Locating…" : "Current location"}
            </button>
          </div>

          {(form.lat && form.lng) ? (
            <div className="mt-2 text-[11px] text-muted-foreground">
              Pinned at <span className="font-mono">{form.lat}, {form.lng}</span>{" "}
              · <a className="text-primary underline" href={`https://www.google.com/maps?q=${form.lat},${form.lng}`} target="_blank" rel="noreferrer">Preview on Google Maps</a>
            </div>
          ) : null}

          {locMsg && (
            <div className={`mt-2 text-[11px] ${locMsg.tone === "ok" ? "text-primary" : "text-red-600"}`}>{locMsg.text}</div>
          )}
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
        <p className="mt-2 text-[11px] text-muted-foreground">Create a product on payhip.com and paste its checkout link here. Drivers will be sent to Payhip to pay you directly.</p>
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
        <textarea rows={4} value={rules} onChange={(e) => setRules(e.target.value)} placeholder="One rule per line" className={`${input} h-auto py-2`} />
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

      <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-[1.01] disabled:opacity-60">
        {saved ? <><Check className="h-4 w-4" /> Saved! Redirecting…</> : busy ? "Saving…" : mode === "edit" ? "Save changes" : "Publish charger"}
      </button>
    </form>
  );
}

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