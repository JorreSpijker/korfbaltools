"use client";

import { useEffect, useState } from "react";
import { getConsent, setConsent, type ConsentState } from "./consent";

export interface CookieConsentProps {
  privacyHref?: string;
}

export function CookieConsent({ privacyHref = "/privacy" }: CookieConsentProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getConsent() === null);
  }, []);

  if (!visible) return null;

  function choose(state: ConsentState) {
    setConsent(state);
    setVisible(false);
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 border-t border-neutral-200 bg-white shadow-lg">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-4 sm:p-6">
        <p className="text-sm text-neutral-600">
          We gebruiken cookies om het gebruik van Korfbaltools.nl te meten. Lees ons{" "}
          <a href={privacyHref} className="underline hover:no-underline">
            privacybeleid
          </a>
          .
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="rounded-md px-4 py-2 text-sm border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Weigeren
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="rounded-md px-4 py-2 text-sm bg-primary-500 text-white hover:bg-primary-800 transition-colors"
          >
            Accepteren
          </button>
        </div>
      </div>
    </div>
  );
}
