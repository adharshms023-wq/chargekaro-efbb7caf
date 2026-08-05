import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  BarChart3, Bookmark, IndianRupee, Users, Zap, ArrowUpRight, Star,
  MessageSquare, Activity, Lock, Pencil, Trash2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useFavorites } from "@/lib/favorites";
import { mapDbCharger, type Charger } from "@/data/chargers";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Host Dashboard — ChargeShare" },
      { name: "description", content: "Manage your listed chargers, sessions and earnings." },
      { property: "og:title", content: "Host Dashboard — ChargeShare" },
      { property: "og:description", content: "Manage your listed chargers and earnings." },
    ],
  }),
  component: Dashboard,
});

interface Session {
  id: string;
  charger_id: string;
  amount: number;
  kwh: number | null;
  status: "pending" | "paid" | "cancelled";
  created_at: string;
}

function Dashboard() {
  const { user, loading } = useAuth();
  const { favorites } = useFavorites();
  const qc = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase.from("chargers").delete().eq("id", id);
      if (error) throw error;
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["my_chargers"] }),
        qc.invalidateQueries({ queryKey: ["chargers"] }),
      ]);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete charger");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const myChargers = useQuery({
    queryKey: ["my_chargers", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Charger[]> => {
      const { data, error } = await supabase
        .from("chargers")
        .select(
          "id, owner_id, name, address, city, lat, lng, source, power_kw, speed, connectors, price_per_kwh, hours, description, image, owner_name, facilities, rules, payhip_product_url, payhip_mode",
        )
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []).map((r) => mapDbCharger(r as any));
    },
  });

  const sessions = useQuery({
    queryKey: ["my_sessions", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Session[]> => {
      const chargerIds = (myChargers.data ?? []).map((c) => c.id);
      if (chargerIds.length === 0) return [];
      const { data, error } = await supabase
        .from("charging_sessions")
        .select("id, charger_id, amount, kwh, status, created_at")
        .in("charger_id", chargerIds)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as Session[];
    },
  });

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Host dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to see your listings, sessions and earnings.</p>
        <Link to="/auth" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
          Sign in
        </Link>
      </div>
    );
  }

  const chargers = myChargers.data ?? [];
  const paid = (sessions.data ?? []).filter((s) => s.status === "paid");
  const earnings = paid.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const totalKwh = paid.reduce((sum, s) => sum + Number(s.kwh || 0), 0);

  const stats = [
    { icon: Users, label: "Sessions", value: String(sessions.data?.length ?? 0) },
    { icon: Zap, label: "kWh delivered", value: totalKwh.toFixed(1) },
    { icon: IndianRupee, label: "Earnings (paid)", value: `₹${earnings.toFixed(0)}` },
    { icon: Bookmark, label: "Bookmarks", value: String(favorites.length) },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <BarChart3 className="h-3.5 w-3.5" /> HOST DASHBOARD
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Welcome back 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Link to="/list" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20">
          + Add another charger
        </Link>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-4 w-4" />
              </div>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                <ArrowUpRight className="h-3 w-3" /> live
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your chargers</h2>
              <span className="text-xs text-muted-foreground">{chargers.length} listed</span>
            </div>
            <div className="mt-4 space-y-3">
              {chargers.map((c) => (
                <div key={c.id} className="rounded-xl border border-border bg-background p-3">
                  <div className="flex items-center gap-3">
                    <img src={c.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{c.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{c.address}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        ₹{c.pricePerKwh}/kWh · {c.powerKw} kW · {c.connectors.join(", ")}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Link to="/charger/$id" params={{ id: c.id }} className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted">Open</Link>
                    <Link to="/edit/$id" params={{ id: c.id }} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted">
                      <Pencil className="h-3 w-3" /> Edit
                    </Link>
                    {confirmId === c.id ? (
                      <>
                        <span className="text-xs text-muted-foreground">Delete this listing?</span>
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deletingId === c.id}
                          className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                        >
                          {deletingId === c.id ? "Deleting…" : "Confirm"}
                        </button>
                        <button onClick={() => setConfirmId(null)} className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold">Cancel</button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmId(c.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {chargers.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  You haven't listed a charger yet. <Link to="/list" className="text-primary underline">List one →</Link>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent sessions</h2>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Activity className="h-3.5 w-3.5" /> {sessions.data?.length ?? 0}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {(sessions.data ?? []).slice(0, 10).map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-3 text-sm">
                  <div>
                    <div className="font-medium">₹{Number(s.amount).toFixed(0)} · {s.kwh ? `${Number(s.kwh).toFixed(1)} kWh` : "no kWh"}</div>
                    <div className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()}</div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    s.status === "paid" ? "bg-emerald-100 text-emerald-700" :
                    s.status === "cancelled" ? "bg-slate-100 text-slate-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>{s.status}</span>
                </div>
              ))}
              {(sessions.data ?? []).length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No sessions yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-5">
            <div className="text-xs font-bold uppercase tracking-wide text-primary">Getting paid</div>
            <p className="mt-2 text-sm">
              Add a <span className="font-semibold">Payhip product link</span> to each charger. When drivers tap "Pay host", they check out on Payhip and the money lands in your account.
            </p>
            <a href="https://payhip.com" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary underline">
              Create a Payhip product →
            </a>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Tips</h2>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li className="flex gap-2"><Star className="mt-0.5 h-3 w-3 shrink-0 text-primary" /> Sharp photos boost bookings by 30%.</li>
              <li className="flex gap-2"><Star className="mt-0.5 h-3 w-3 shrink-0 text-primary" /> Enable "Ports available" live updates in off-peak hours.</li>
              <li className="flex gap-2"><Star className="mt-0.5 h-3 w-3 shrink-0 text-primary" /> Keep house rules short and specific.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
