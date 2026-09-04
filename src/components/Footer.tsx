import { PlugZap } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-2 lg:grid-cols-5">
        <div>
          <div className="flex items-center gap-2 font-semibold">
            <span className="clay-primary grid h-10 w-10 place-items-center">
              <PlugZap className="h-5 w-5" strokeWidth={2.4} />
            </span>
            ChargeShare
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            A community-powered map of EV chargers across India.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/explore" className="hover:text-foreground">Map</Link></li>
            <li><Link to="/list" className="hover:text-foreground">List a charger</Link></li>
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/" hash="support" className="hover:text-foreground">Support ChargeKaro ⚡</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Resources</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/resources" className="hover:text-foreground">EV charging guides</Link></li>
            <li><Link to="/resources/$slug" params={{ slug: "how-to-find-reliable-ev-charging-stations-in-india" }} className="hover:text-foreground">Find a reliable station</Link></li>
            <li><Link to="/resources/$slug" params={{ slug: "ev-charging-connectors-and-ac-vs-dc-explained" }} className="hover:text-foreground">Connectors & AC vs DC</Link></li>
            <li><Link to="/resources/$slug" params={{ slug: "how-to-plan-an-ev-road-trip-with-charging-stops" }} className="hover:text-foreground">Plan an EV road trip</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Coming soon</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Login</li>
            <li>Bookings</li>
            <li>AI Route Planner</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Contact</h4>
          <p className="mt-3 text-sm text-muted-foreground">aarshuu777@gmail.com</p>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ChargeShare · Built with OpenStreetMap
      </div>
    </footer>
  );
}
