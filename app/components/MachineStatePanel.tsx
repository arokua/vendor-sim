import { exportData } from "../lib/export";
import { importData } from "../lib/import";
import type { CoinInput, Product } from "../lib/types";

export function MachineStatePanel({
  rows,
  products,
  onImport
}: {
  rows: CoinInput[];
  products: Product[];
  onImport: (data: { register: CoinInput[]; products: Product[] }) => void;
}) {
  return (
    <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/60">
      <h2 className="text-sm font-semibold mb-3">Machine State</h2>
      <p className="text-xs text-slate-400 mb-3">
        Export or import the current coin register and product inventory.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Export */}
        <button
          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-xs"
          onClick={() => {
            const txt = exportData(rows, products);
            const blob = new Blob([txt], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "machine_state.txt";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          ⬇ Export Machine State
        </button>

        {/* Import */}
        <label className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-xs cursor-pointer">
          ⬆ Import Machine State
          <input
            type="file"
            accept=".txt"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const txt = await file.text();
              const parsed = importData(txt);
              onImport(parsed);
            }}
          />
        </label>
      </div>
    </div>
  );
}
