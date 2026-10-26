"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Platform = "android" | "ios" | "desktop";

function detectPlatform(): Platform {
  const ua = window.navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) {
    return "ios";
  }
  if (/android/.test(ua)) {
    return "android";
  }
  return "desktop";
}

function isStandaloneMode(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function InstallApp() {
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [isInstalled, setIsInstalled] = useState(true);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"android" | "ios">("android");
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    const installed = isStandaloneMode();
    const nextPlatform = detectPlatform();
    setIsInstalled(installed);
    setPlatform(nextPlatform);
    setTab(nextPlatform === "ios" ? "ios" : "android");

    function onBeforeInstall(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }

    function onInstalled() {
      setIsInstalled(true);
      setInstallEvent(null);
      setOpen(false);
      setStatus(null);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function handleAndroidInstall() {
    if (!installEvent) {
      setStatus(
        "Open this site in Chrome on Android, then tap Install. If the button stays disabled, use Chrome menu → Install app / Add to Home screen.",
      );
      return;
    }

    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") {
      setInstallEvent(null);
      setStatus("Installing…");
    } else {
      setStatus("Install cancelled. You can try again anytime.");
    }
  }

  if (isInstalled) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="install-fab"
        onClick={() => setOpen(true)}
      >
        Install app
      </button>

      {open ? (
        <div
          className="install-modal-backdrop"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            className="install-modal panel pop-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <p className="eyebrow">Get the app</p>
              <h2 id="install-title">Install Quiz Time</h2>
              <p className="lede">
                Add it to your phone home screen for Android and iOS.
              </p>
            </header>

            <div className="install-tabs" role="tablist" aria-label="Platform">
              <button
                type="button"
                role="tab"
                aria-selected={tab === "android"}
                className={tab === "android" ? "is-active" : ""}
                onClick={() => setTab("android")}
              >
                Android
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "ios"}
                className={tab === "ios" ? "is-active" : ""}
                onClick={() => setTab("ios")}
              >
                iPhone / iPad
              </button>
            </div>

            {tab === "android" ? (
              <ol className="install-steps">
                <li>Open Quiz Time in <strong>Chrome</strong> on your Android phone.</li>
                <li>
                  Tap <strong>Install app</strong> below, or open Chrome menu
                  (⋮) → <strong>Install app</strong> /{" "}
                  <strong>Add to Home screen</strong>.
                </li>
                <li>Confirm, then launch Quiz Time from your home screen.</li>
              </ol>
            ) : (
              <ol className="install-steps">
                <li>Open Quiz Time in <strong>Safari</strong> (required on iOS).</li>
                <li>
                  Tap the <strong>Share</strong> button at the bottom.
                </li>
                <li>
                  Choose <strong>Add to Home Screen</strong>, then tap{" "}
                  <strong>Add</strong>.
                </li>
              </ol>
            )}

            {status ? <p className="install-status">{status}</p> : null}

            <div className="install-actions">
              {tab === "android" ? (
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => void handleAndroidInstall()}
                >
                  {installEvent || platform === "android"
                    ? "Install on Android"
                    : "How to install on Android"}
                </button>
              ) : (
                <p className="install-ios-note">
                  iOS does not allow a one-tap install button. Use Share → Add to
                  Home Screen in Safari.
                </p>
              )}
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
