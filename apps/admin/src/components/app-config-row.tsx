"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ApiErrorBody, AppConfig } from "@korfbaltools/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AppConfigRowProps {
  app: AppConfig;
}

export function AppConfigRow({ app }: AppConfigRowProps) {
  const router = useRouter();
  const [title, setTitle] = useState(app.title);
  const [imageUrl, setImageUrl] = useState(app.imageUrl ?? "");
  const [visible, setVisible] = useState(app.visible);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = title !== app.title || imageUrl !== (app.imageUrl ?? "") || visible !== app.visible;

  async function save() {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/admin/apps/${app.capability}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, imageUrl: imageUrl.trim() === "" ? null : imageUrl.trim(), visible }),
    });
    setPending(false);
    if (!response.ok) {
      const body = (await response.json()) as ApiErrorBody;
      setError(body.error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 rounded-md border border-neutral-200 p-6">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-neutral-500">{app.capability}</span>
        <div className="flex items-center gap-2">
          <Checkbox
            id={`${app.capability}-visible`}
            checked={visible}
            onCheckedChange={(checked) => setVisible(checked === true)}
          />
          <Label htmlFor={`${app.capability}-visible`}>Zichtbaar op homepage</Label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${app.capability}-title`}>Titel</Label>
          <input
            id={`${app.capability}-title`}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${app.capability}-image`}>Afbeelding URL</Label>
          <input
            id={`${app.capability}-image`}
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            placeholder="https://..."
            className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm"
          />
        </div>
      </div>

      {imageUrl && <img src={imageUrl} alt="" className="h-16 w-16 rounded-md object-cover" />}

      <div className="flex items-center gap-3">
        <Button disabled={!dirty || pending} onClick={save}>
          Opslaan
        </Button>
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </div>
  );
}
