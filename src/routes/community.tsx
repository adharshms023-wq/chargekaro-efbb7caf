import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Radio, Zap, Ban, CheckCheck, MessageSquare, Send, Lock } from "lucide-react";
import { useLiveUpdates, timeAgo, timeLeft, KIND_LABEL, type UpdateKind } from "@/lib/live-updates";
import { useChargers } from "@/lib/chargers-store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Charge Together — ChargeShare Community" },
      { name: "description", content: "Live charger updates from EV drivers across India — no queue, ports available, offline alerts." },
      { property: "og:title", content: "Charge Together — ChargeShare Community" },
      { property: "og:description", content: "Live charger updates from EV drivers across India." },
    ],
  }),
  component: CommunityFeed,
});

const KIND_ORDER: { v: UpdateKind; l: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { v: "charging_now", l: "I'm charging here", icon: Zap },
  { v: "no_queue", l: "No queue", icon: CheckCheck },
  { v: "ports_available", l: "Ports available", icon: CheckCheck },
  { v: "offline", l: "Station offline", icon: Ban },
  { v: "note", l: "Note", icon: MessageSquare },
];

function CommunityFeed() {
  const { updates, postUpdate, isPosting, postError } = useLiveUpdates();
  const { chargers } = useChargers();
  const { user } = useAuth();
  const [kind, setKind] = useState<UpdateKind>("no_queue");
  const [message, setMessage] = useState("");
  const [chargerId, setChargerId] = useState<string>("");

  useEffect(() => {
    if (!chargerId && chargers.length > 0) setChargerId(chargers[0].id);
  }, [chargers, chargerId]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !chargerId) return;
    postUpdate({ chargerId, kind, message: message.trim(), hours: 2 });
    setMessage("");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Radio className="h-3.5 w-3.5 animate-pulse" /> LIVE COMMUNITY FEED
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Charge Together</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Real-time updates from EV drivers. Posts auto-expire after a few hours so info stays fresh.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {updates.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Feed is quiet. Post the first live update →
            </div>
          )}
          {updates.map((u) => (
            <div key={u.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/15 text-primary font-semibold">
                  {u.author.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{u.author}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      u.kind === "offline" ? "bg-slate-100 text-slate-700" :
                      u.kind === "charging_now" ? "bg-amber-100 text-amber-700" :
                      "bg-primary/15 text-primary"
                    }`}>{KIND_LABEL[u.kind]}</span>
                    <span className="text-xs text-muted-foreground">· {timeAgo(u.createdAt)}</span>
                    <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{timeLeft(u.expiresAt)}</span>
                  </div>
                  {u.chargerName && (
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      at <span className="font-medium text-foreground">{u.chargerName}</span>{u.city && ` · ${u.city}`}
                    </div>
                  )}
                  <p className="mt-2 text-sm">{u.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside>
          {!user ? (
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
              <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Lock className="h-5 w-5" />
              </div>
              <div className="mt-3 text-sm font-semibold">Sign in to post updates</div>
              <p className="mt-1 text-xs text-muted-foreground">
                We attribute posts to your account and auto-expire them in a few hours.
              </p>
              <Link to="/auth" className="mt-4 inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
                Sign in
              </Link>
            </div>
          ) : chargers.length === 0 ? (
            <div className="sticky top-24 rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
              No chargers yet — <Link to="/list" className="text-primary underline">list one</Link> to start the feed.
            </div>
          ) : (
            <form onSubmit={submit} className="sticky top-24 space-y-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="text-sm font-semibold">Post a live update</div>
              <div>
                <div className="mb-1 text-xs font-medium text-muted-foreground">What's happening?</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {KIND_ORDER.map((k) => (
                    <button key={k.v} type="button" onClick={() => setKind(k.v)}
                      className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                        kind === k.v ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted"
                      }`}>
                      <k.icon className="h-3.5 w-3.5" /> {k.l}
                    </button>
                  ))}
                </div>
              </div>
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Charger</span>
                <select value={chargerId} onChange={(e) => setChargerId(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm outline-none focus:border-primary">
                  {chargers.slice(0, 60).map((c) => (
                    <option key={c.id} value={c.id}>{c.name} — {c.city}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Message</span>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                  rows={3} maxLength={200} placeholder="e.g. 2 CCS2 ports open, ~50 kW real speed"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              </label>
              {postError && <div className="text-xs text-red-600">{postError.message}</div>}
              <button type="submit" disabled={isPosting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                <Send className="h-4 w-4" /> {isPosting ? "Posting…" : "Post update"}
              </button>
              <p className="text-[11px] text-muted-foreground">Auto-expires in 2 hours.</p>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
