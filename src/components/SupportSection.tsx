import { useEffect, useRef } from "react";

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
    <section id="support" className="scroll-mt-20 mx-auto max-w-7xl px-4 pb-16 sm:pb-20">
      <div className="mx-auto max-w-2xl rounded-3xl border border-border/60 bg-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:p-12">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          Support the project
        </span>
        <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
          Help us build a better EV charging experience ⚡
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          ChargeKaro is an independent project built to make finding EV charging stations easier.
          If you find ChargeKaro useful, you can support the project and help us keep improving it.
        </p>

        <div className="mt-8 flex justify-center">
          <form ref={formRef} className="flex justify-center" />
        </div>

        <p className="mt-8 border-t border-border/60 pt-5 text-xs text-muted-foreground">
          Every contribution helps us improve ChargeKaro.
        </p>
      </div>
    </section>
  );
}
