"use client";

import { useEffect } from "react";

export interface ServiceWorkerRegisterProps {
  swUrl?: string;
}

export function ServiceWorkerRegister({ swUrl = "/sw.js" }: ServiceWorkerRegisterProps) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register(swUrl).catch(() => {});
  }, [swUrl]);

  return null;
}
