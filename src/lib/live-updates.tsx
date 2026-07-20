import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

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

interface Ctx {
  updates: LiveUpdate[];
  postUpdate: (u: Omit<LiveUpdate, "id" | "createdAt" | "expiresAt"> & { hours?: number }) => void;
  updatesFor: (chargerId: string) => LiveUpdate[];
}

const LiveContext = createContext<Ctx | null>(null);

const now = () => Date.now();
const HOUR = 60 * 60 * 1000;

function seed(): LiveUpdate[] {
  const t = now();
  return [
    { id: "u1", chargerId: "kochi-1", chargerName: "KSEB Kaloor", city: "Kochi", author: "Arjun", kind: "no_queue", message: "No queue right now — plugged in in 2 min.", createdAt: t - 12 * 60 * 1000, expiresAt: t + 2 * HOUR },
    { id: "u2", chargerId: "tvm-4", chargerName: "Technopark EV Hub", city: "Trivandrum", author: "Sneha", kind: "offline", message: "One DC port is offline — only CCS2 working.", createdAt: t - 40 * 60 * 1000, expiresAt: t + 1.5 * HOUR },
    { id: "u3", chargerId: "thrissur-1", chargerName: "Sakthan Nagar", city: "Thrissur", author: "Vishnu", kind: "ports_available", message: "2 ports free, charging at 55 kW.", createdAt: t - 5 * 60 * 1000, expiresAt: t + 3 * HOUR },
    { id: "u4", chargerId: "kkd-1", chargerName: "Kozhikode Beach", city: "Kozhikode", author: "Meera", kind: "charging_now", message: "I'm charging here now — will be done in 20 min.", createdAt: t - 20 * 60 * 1000, expiresAt: t + 1 * HOUR },
  ];
}

export function LiveUpdatesProvider({ children }: { children: ReactNode }) {
  const [updates, setUpdates] = useState<LiveUpdate[]>(() => seed());

  useEffect(() => {
    const t = setInterval(() => {
      setUpdates((prev) => prev.filter((u) => u.expiresAt > now()));
    }, 30 * 1000);
    return () => clearInterval(t);
  }, []);

  const postUpdate: Ctx["postUpdate"] = (u) => {
    const created = now();
    const hours = u.hours ?? 2;
    setUpdates((prev) => [
      {
        id: `u-${created}`,
        chargerId: u.chargerId,
        chargerName: u.chargerName,
        city: u.city,
        author: u.author,
        kind: u.kind,
        message: u.message,
        createdAt: created,
        expiresAt: created + hours * HOUR,
      },
      ...prev,
    ]);
  };

  const updatesFor = (chargerId: string) => updates.filter((u) => u.chargerId === chargerId);

  return (
    <LiveContext.Provider value={{ updates, postUpdate, updatesFor }}>{children}</LiveContext.Provider>
  );
}

export function useLiveUpdates() {
  const ctx = useContext(LiveContext);
  if (!ctx) throw new Error("useLiveUpdates must be used within LiveUpdatesProvider");
  return ctx;
}

export function timeAgo(ts: number): string {
  const s = Math.max(0, Math.floor((now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

export function timeLeft(ts: number): string {
  const s = Math.max(0, Math.floor((ts - now()) / 1000));
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