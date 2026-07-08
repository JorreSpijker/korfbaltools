"use client";

import { useEffect, useState } from "react";

const DISMISSED_KEY = "pwa-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return;

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredEvent(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  if (!deferredEvent) return null;

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setDeferredEvent(null);
  }

  async function install() {
    await deferredEvent!.prompt();
    await deferredEvent!.userChoice;
    setDeferredEvent(null);
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm rounded-lg border border-neutral-200 bg-white shadow-lg p-4 flex items-center gap-3">
      <p className="text-sm text-neutral-700 flex-1">Installeer deze app voor snellere toegang.</p>
      <div className="flex gap-2 shrink-0">
        <button type="button" onClick={dismiss} className="text-sm text-neutral-500 hover:underline">
          Niet nu
        </button>
        <button
          type="button"
          onClick={install}
          className="rounded-md px-3 py-1.5 text-sm bg-primary-500 text-white hover:bg-primary-800 transition-colors"
        >
          Installeren
        </button>
      </div>
    </div>
  );
}
