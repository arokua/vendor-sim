"use client";

import type { ChangeEvent } from "react";

export interface DenominationRowProps {
  index: number;
  denom: number;
  count: number;
  onChange: (index: number, field: "denom" | "count", value: number) => void;
  onRemove: (index: number) => void;
}

export function DenominationRow(props: DenominationRowProps) {
  const { index, denom, count, onChange, onRemove } = props;

  const handleChange =
    (field: "denom" | "count") =>
    (e: ChangeEvent<HTMLInputElement>): void => {
      const raw = e.target.value;
      const numeric = raw === "" ? 0 : Number(raw);
      if (Number.isNaN(numeric)) return;
      onChange(index, field, numeric);
    };

  return (
    <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
      <input
        type="number"
        className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        min={0}
        step={5}
        value={denom || ""}
        onChange={handleChange("denom")}
        placeholder="Denom (cents)"
      />
      <input
        type="number"
        className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        min={0}
        value={count || ""}
        onChange={handleChange("count")}
        placeholder="Count"
      />
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="text-xs rounded-md border border-red-500/50 px-2 py-1 text-red-400 hover:bg-red-500/10"
      >
        Remove
      </button>
    </div>
  );
}
