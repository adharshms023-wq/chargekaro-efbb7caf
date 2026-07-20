import { lazy, Suspense } from "react";
import { ClientOnly } from "./ClientOnly";
import type { Charger } from "@/data/chargers";

const ChargerMap = lazy(() => import("./ChargerMap").then((m) => ({ default: m.ChargerMap })));

interface Props {
  chargers: Charger[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

export function LazyChargerMap(props: Props) {
  return (
    <ClientOnly fallback={<div className="grid h-full place-items-center rounded-2xl border border-border bg-muted/30 text-sm text-muted-foreground">Loading map…</div>}>
      <Suspense fallback={<div className="grid h-full place-items-center rounded-2xl border border-border bg-muted/30 text-sm text-muted-foreground">Loading map…</div>}>
        <ChargerMap {...props} />
      </Suspense>
    </ClientOnly>
  );
}