"use client";

import { DenominationRow } from "@/app/components/DenominationRow";
import type { CoinInput } from "@/app/lib/types";

interface Props {
  rows: CoinInput[];
  onChangeRow: (index: number, field: "denom" | "count", value: number) => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
  disabled?: boolean;
  totalBalance: number; // ← NEW
}


export function CashRegisterEditor(props: Props) {
    const { rows, onChangeRow, onAddRow, onRemoveRow, disabled } = props;
    const dollars = (props.totalBalance / 100).toFixed(2);
    return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-emerald-500/10">
        <h2 className="text-lg font-semibold mb-1">Cash Register</h2>
        <p className="text-xs text-slate-400 mb-4">
            Define your denominations (in cents) and available counts. This will be used
            as the initial state for the change-making algorithm.
            <br/>
            This assume dollars and cents units names.
        </p>

    <div className="space-y-2">
        {rows.map((row, idx) => (
          <DenominationRow
            key={idx}
            index={idx}
            denom={row.denom}
            count={row.count}
            onChange={onChangeRow}
            onRemove={onRemoveRow}
          />
        ))}
    </div>
    <p className="text-xs mt-3">
        Current balance:{" "}
        <span className={props.totalBalance < 500 ? "text-red-400" : "text-emerald-300"}>
            ${dollars}
        </span>
    </p>

        <button
            type="button"
            onClick={onAddRow}
            disabled={disabled}
            className="mt-4 rounded-md border border-emerald-500/60 px-3 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-600/10 disabled:opacity-50"
        >
        + Add denomination
        </button>
    </div>
  );
}
