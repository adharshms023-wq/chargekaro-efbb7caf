import { useEffect, useRef } from "react";
import { Heart, Sparkles, Zap, ShieldCheck, MapPin, Users } from "lucide-react";

export function SupportSection() {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const form = formRef.current;
    if (!form || form.querySelector("script")) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/payment-button.js";
    script.async = true;
    script.setAttribute("data-payment_button_id", "pl_TNYSWnDL0f3jQ0");
    form.appendChild(script);
  }, []);

  return (
    <section id="support" className="scroll-mt-20 mx-auto max-w-7xl px-4 pb-16 sm:pb-24">
      {/* Gradient frame */}
      <div className="group relative mx-auto max-w-2xl">
        {/* Animated glow behind the card */}
        <div
          aria-hidden
          className="absolute -inset-1 rounded-[2rem] bg-[linear-gradient(120deg,hsl(var(--primary)),hsl(var(--accent)),hsl(var(--primary)))] opacity-40 blur-lg transition-opacity duration-500 group-hover:opacity-70 animate-pulse"
        />

        <div className="relative overflow-hidden rounded-[2rem] border border-primary/30 bg-card text-center shadow-2xl">
          {/* Decorative orbs */}
          <div aria-hidden className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-20 -right-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />

          {/* Shimmer sweep */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,hsl(var(--primary)/0.08)_50%,transparent_60%)] bg-[length:250%_250%] animate-[shimmer_5s_ease-in-out_infinite]"
          />

          <div className="relative px-6 py-10 sm:px-12 sm:py-14">
            {/* Floating bolt badge */}
            <div className="relative mx-auto grid h-16 w-16 place-items-center">
              <span aria-hidden className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/25" />
              <span className="clay-primary relative grid h-16 w-16 place-items-center rounded-2xl shadow-lg">
                <Zap className="h-8 w-8" strokeWidth={2.4} />
              </span>
            </div>

            <span className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Support the project
            </span>

            <h2 className="mt-5 text-2xl font-bold tracking-tight sm:text-4xl">
              Fuel the future of{" "}
              <span className="bg-[linear-gradient(120deg,hsl(var(--primary)),hsl(var(--accent)))] bg-clip-text text-transparent">
                EV charging in India
              </span>{" "}
              ⚡
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              ChargeKaro is an independent, community-powered project. Every contribution keeps the
              map growing, the data fresh, and new features coming — built by drivers, for drivers.
            </p>

            {/* Impact chips */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-xs font-medium">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" /> More stations mapped
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1.5">
                <Users className="h-3.5 w-3.5 text-primary" /> Stronger community
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Secure via Razorpay
              </span>
            </div>

            {/* Payment button with attention ring */}
            <div className="relative mt-9 flex justify-center">
              <span
                aria-hidden
                className="absolute -inset-3 rounded-full bg-primary/15 blur-md animate-pulse"
              />
              <form ref={formRef} className="relative flex justify-center" />
            </div>

            <p className="mt-8 inline-flex items-center gap-1.5 border-t border-border/60 pt-5 text-xs text-muted-foreground">
              <Heart className="h-3.5 w-3.5 text-primary" />
              Every contribution, big or small, keeps ChargeKaro charging forward.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
