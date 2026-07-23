import { Link, useNavigate } from "@tanstack/react-router";
import { PlugZap, Menu, X, LogIn, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

const links = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Explore" },
  { to: "/community", label: "Community" },
  { to: "/list", label: "List Charger" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/about", label: "About" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="clay-primary grid h-10 w-10 place-items-center">
            <PlugZap className="h-5 w-5" strokeWidth={2.4} />
          </span>
          <span className="text-lg tracking-tight">ChargeShare</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "bg-primary/10 text-primary" }}
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={handleSignOut}
              className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted"
              title={user.email ?? undefined}
            >
              <User className="h-3.5 w-3.5" /> Sign out
            </button>
          ) : (
            <Link
              to="/auth"
              className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              <LogIn className="h-3.5 w-3.5" /> Sign in
            </Link>
          )}
        </nav>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col p-2">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "bg-primary/10 text-primary" }}
                className="rounded-md px-4 py-3 text-sm font-medium"
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => { setOpen(false); handleSignOut(); }}
                className="mt-1 inline-flex items-center gap-2 rounded-md px-4 py-3 text-left text-sm font-semibold"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="mt-1 inline-flex items-center gap-2 rounded-md bg-primary/10 px-4 py-3 text-sm font-semibold text-primary"
              >
                <LogIn className="h-4 w-4" /> Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
