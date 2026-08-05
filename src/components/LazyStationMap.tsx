import { lazy, Suspense } from "react";
import { ClientOnly } from "./ClientOnly";
import type { Station } from "@/data/stations";
import type { Coords } from "@/hooks/use-geolocation";

const StationMap = lazy(() => import("./StationMap").then((m) => ({ default: m.StationMap })));

interface Props {
  stations: Station[];
  height?: string;
  onSelect?: (id: string) => void;
  fitBounds?: boolean;
  userLocation?: Coords | null;
}

const Fallback = () => (
  <div className="grid h-full place-items-center rounded-2xl border border-border bg-muted/30 text-sm text-muted-foreground">
    Loading map…
  </div>
);

export function LazyStationMap(props: Props) {
  return (
    <ClientOnly fallback={<Fallback />}>
      <Suspense fallback={<Fallback />}>
        <StationMap {...props} />
      </Suspense>
    </ClientOnly>
  );
}