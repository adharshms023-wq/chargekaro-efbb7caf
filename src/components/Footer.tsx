import { PlugZap } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
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
