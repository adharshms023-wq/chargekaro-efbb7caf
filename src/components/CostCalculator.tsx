import { useMemo, useState } from "react";
import { Calculator, Zap, IndianRupee, Clock } from "lucide-react";

interface Props {
  defaultPrice?: number;
  defaultPowerKw?: number;
}

export function CostCalculator({ defaultPrice = 18, defaultPowerKw = 30 }: Props) {
  const [capacity, setCapacity] = useState(40); // kWh
  const [current, setCurrent] = useState(20);
  const [target, setTarget] = useState(80);
  const [price, setPrice] = useState(defaultPrice);
  const [power, setPower] = useState(defaultPowerKw);

  const { energy, cost, minutes } = useMemo(() => {
    const pct = Math.max(0, target - current) / 100;
    const energy = pct * capacity;
    const cost = energy * price;
    const minutes = power > 0 ? (energy / power) * 60 : 0;
    return { energy, cost, minutes };
  }, [capacity, current, target, price, power]);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
          <Calculator className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold">Charging cost calculator</div>
          <div className="text-xs text-muted-foreground">Estimate cost, energy and time</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <NumField label="Battery (kWh)" value={capacity} onChange={setCapacity} min={10} max={120} />
        <NumField label="Price ₹/kWh" value={price} onChange={setPrice} min={1} max={60} />
        <NumField label="Current %" value={current} onChange={setCurrent} min={0} max={100} />
        <NumField label="Target %" value={target} onChange={setTarget} min={0} max={100} />
        <NumField label="Charger kW" value={power} onChange={setPower} min={1} max={250} full />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Result icon={Zap} label="Energy" value={`${energy.toFixed(1)} kWh`} />
        <Result icon={IndianRupee} label="Cost" value={`₹${cost.toFixed(0)}`} accent />
        <Result icon={Clock} label="Time" value={`${Math.round(minutes)} min`} />
      </div>
    </div>
  );
}

function NumField({ label, value, onChange, min, max, full }: { label: string; value: number; onChange: (n: number) => void; min: number; max: number; full?: boolean }) {
  return (
    <label className={`flex flex-col gap-1 ${full ? "col-span-2" : ""}`}>
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <input
        type="number" min={min} max={max} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function Result({ icon: Icon, label, value, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 text-center ${accent ? "border-primary/40 bg-primary/10" : "border-border bg-background"}`}>
      <Icon className={`mx-auto h-4 w-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />
      <div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`text-sm font-bold ${accent ? "text-primary" : ""}`}>{value}</div>
    </div>
  );
}