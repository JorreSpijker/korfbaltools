"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { getConsent, onConsentChange } from "./consent";

export interface GoogleAnalyticsProps {
  gaId?: string;
}

export function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(getConsent() === "granted");
    return onConsentChange((state) => setEnabled(state === "granted"));
  }, []);

  if (!gaId || !enabled) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
