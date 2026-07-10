"use client";

import { useState } from "react";
import { Modal } from "./Modal";

interface ConcedeFormProps {
  onSubmit: (verdedigerNaam: string) => void;
  onClose: () => void;
}

export function ConcedeForm({ onSubmit, onClose }: ConcedeFormProps) {
  const [verdedigerNaam, setVerdedigerNaam] = useState("");

  function bevestig() {
    const naam = verdedigerNaam.trim();
    if (naam.length === 0) return;
    onSubmit(naam);
    onClose();
  }

  return (
    <Modal titleId="concede-form-title" onClose={onClose} className="p-6">
      <h2 id="concede-form-title" className="text-lg font-semibold text-neutral-900">
        Tegendoelpunt
      </h2>
      <div className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm text-neutral-700">
          Verdediger gepasseerd
          <input
            type="text"
            autoFocus
            value={verdedigerNaam}
            onChange={(e) => setVerdedigerNaam(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2"
          />
        </label>
        <button
          type="button"
          onClick={bevestig}
          className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-600"
        >
          Vastleggen
        </button>
      </div>
    </Modal>
  );
}
