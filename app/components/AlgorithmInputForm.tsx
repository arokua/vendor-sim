import React from "react";

interface Props {
  paymentAmount: number;
  onChangePaymentAmount: (value: number | ((prev: number) => number)) => void;
  onSubmit: () => void;
  onReset: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const MONEY_PRESETS = [
  { label: "+$5", amount: 500 },
  { label: "+$10", amount: 1000 },
  { label: "+$20", amount: 2000 }
];

export function AlgorithmInputForm({
  paymentAmount,
  onChangePaymentAmount,
  onSubmit,
  onReset,
  disabled = false,
  isLoading = false
}: Props) {
  return (
    <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/60 space-y-4">
      <h2 className="font-semibold text-sm">Payment</h2>

      {/* Manual Payment Input */}
      <input
        type="number"
        className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-sm"
        value={paymentAmount}
        onChange={(e) =>
          onChangePaymentAmount(Number(e.target.value) || 0)
        }
        disabled={disabled}
        placeholder="Enter payment amount (in cents)"
      />

      {/* Scalable Money Presets */}
      <div className="flex gap-2 text-xs">
        {MONEY_PRESETS.map((p) => (
          <button
            key={p.amount}
            className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600"
            onClick={() =>
              onChangePaymentAmount((prev) => prev + p.amount)
            }
            disabled={disabled}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-sm"
          onClick={onSubmit}
          disabled={disabled}
        >
          {isLoading ? "Processing..." : "Run Algorithm"}
        </button>

        <button
          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm"
          onClick={onReset}
          disabled={disabled}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
