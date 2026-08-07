import { useEffect, useState, useCallback } from "react";
import { Download, X, Smartphone, Zap } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

const INSTALL_DISMISSED_KEY = "ck-pwa-install-dismissed";
const INSTALL_SHOWN_KEY = "ck-pwa-install-shown";

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;

    const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) return;

    const dismissedAt = window.localStorage.getItem(INSTALL_DISMISSED_KEY);
    const shownAt = window.localStorage.getItem(INSTALL_SHOWN_KEY);

    // If user dismissed within last 7 days, don't show again
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      if (!isNaN(dismissedTime) && Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Only auto-show once per session
    if (shownAt) return;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      // Show after a short delay so the page feels loaded
      window.setTimeout(() => {
        setIsVisible(true);
        try {
          window.localStorage.setItem(INSTALL_SHOWN_KEY, Date.now().toString());
        } catch {
          // ignore storage errors
        }
      }, 2500);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsVisible(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsVisible(false);
      }
    } catch (error) {
      console.error("PWA install prompt failed:", error);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    try {
      window.localStorage.setItem(INSTALL_DISMISSED_KEY, Date.now().toString());
    } catch {
      // ignore storage errors
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
    >
      <div
        className="w-full max-w-sm transform overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-8 duration-300 sm:max-w-md sm:slide-in-from-bottom-0 sm:zoom-in-95"
        style={{
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.08) inset",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
              <img
                src="/icon-192.png"
                alt="ChargeKaro"
                className="h-12 w-12 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <Zap className="absolute h-8 w-8 text-primary-foreground opacity-0" aria-hidden="true" />
            </div>
            <div>
              <h3
                id="pwa-install-title"
                className="text-lg font-bold leading-tight text-foreground"
              >
                Install ChargeKaro
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get faster access to charging stations near you.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Dismiss install prompt"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl bg-muted/50 px-4 py-3 sm:flex-col sm:items-start sm:gap-2">
            <Smartphone className="h-5 w-5 shrink-0 text-secondary" />
            <span className="text-xs font-medium text-foreground">App-like experience</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-muted/50 px-4 py-3 sm:flex-col sm:items-start sm:gap-2">
            <Zap className="h-5 w-5 shrink-0 text-primary" />
            <span className="text-xs font-medium text-foreground">Find chargers faster</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-muted/50 px-4 py-3 sm:flex-col sm:items-start sm:gap-2">
            <Download className="h-5 w-5 shrink-0 text-accent" />
            <span className="text-xs font-medium text-foreground">Works offline</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/40 active:scale-[0.98] disabled:opacity-70 sm:w-auto sm:flex-1"
          >
            <Download className="h-4 w-4" />
            {isInstalling ? "Installing..." : "Install Now"}
          </button>
          <button
            onClick={handleDismiss}
            className="inline-flex w-full items-center justify-center rounded-2xl border border-border bg-background px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground sm:w-auto sm:flex-1"
          >
            Not now
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Add to your home screen for quick access.
        </p>
      </div>
    </div>
  );
}
