import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UpdateKind =
  | "charging_now"
  | "no_queue"
  | "ports_available"
  | "offline"
  | "note";

export interface LiveUpdate {
  id: string;
  chargerId?: string;
  chargerName?: string;
  city?: string;
  author: string;
  kind: UpdateKind;
  message: string;
  createdAt: number;
  expiresAt: number;
}

export function LiveUpdatesProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

async function fetchUpdates(): Promise<LiveUpdate[]> {
  const { data, error } = await supabase
    .from("live_updates")
    .select("id, charger_id, author_name, kind, message, created_at, expires_at, chargers(name, city)")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((r: any) => ({
    id: r.id,
    chargerId: r.charger_id,
    chargerName: r.chargers?.name,
    city: r.chargers?.city,
    author: r.author_name ?? "Anonymous",
    kind: (r.kind as UpdateKind) ?? "note",
    message: r.message,
    createdAt: new Date(r.created_at).getTime(),
    expiresAt: new Date(r.expires_at).getTime(),
  }));
}

export function useLiveUpdates() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["live_updates"], queryFn: fetchUpdates, staleTime: 15_000 });

  const post = useMutation({
    mutationFn: async (input: {
      chargerId: string;
      kind: UpdateKind;
      message: string;
      hours?: number;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("Sign in to post updates.");
      const hours = input.hours ?? 2;
      const expiresAt = new Date(Date.now() + hours * 3600_000).toISOString();
      const authorName =
        (user.user_metadata?.display_name as string) ||
        (user.user_metadata?.full_name as string) ||
        user.email?.split("@")[0] ||
        "Driver";
      const { error } = await supabase.from("live_updates").insert({
        charger_id: input.chargerId,
        author_id: user.id,
        author_name: authorName,
        kind: input.kind,
        message: input.message,
        expires_at: expiresAt,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["live_updates"] }),
  });

  const updates = q.data ?? [];
  return {
    updates,
    isLoading: q.isLoading,
    postUpdate: (u: {
      chargerId: string;
      chargerName?: string;
      city?: string;
      author?: string;
      kind: UpdateKind;
      message: string;
      hours?: number;
    }) => post.mutate({ chargerId: u.chargerId, kind: u.kind, message: u.message, hours: u.hours }),
    isPosting: post.isPending,
    postError: post.error as Error | null,
    updatesFor: (chargerId: string) => updates.filter((u) => u.chargerId === chargerId),
  };
}

export function timeAgo(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

export function timeLeft(ts: number): string {
  const s = Math.max(0, Math.floor((ts - Date.now()) / 1000));
  if (s < 60) return `<1m left`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m left`;
  const h = Math.floor(m / 60);
  return `${h}h left`;
}

export const KIND_LABEL: Record<UpdateKind, string> = {
  charging_now: "I'm charging here now",
  no_queue: "No queue",
  ports_available: "Ports available",
  offline: "Temporarily offline",
  note: "Note",
};
