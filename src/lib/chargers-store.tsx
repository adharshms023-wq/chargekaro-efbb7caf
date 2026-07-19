import { createContext, useContext, useState, type ReactNode } from "react";
import { chargers as seed, type Charger } from "@/data/chargers";

interface Ctx {
  chargers: Charger[];
  addCharger: (c: Charger) => void;
}

const ChargersContext = createContext<Ctx | null>(null);

export function ChargersProvider({ children }: { children: ReactNode }) {
  const [chargers, setChargers] = useState<Charger[]>(seed);
  const addCharger = (c: Charger) => setChargers((prev) => [c, ...prev]);
  return (
    <ChargersContext.Provider value={{ chargers, addCharger }}>
      {children}
    </ChargersContext.Provider>
  );
}

export function useChargers() {
  const ctx = useContext(ChargersContext);
  if (!ctx) throw new Error("useChargers must be used within ChargersProvider");
  return ctx;
}