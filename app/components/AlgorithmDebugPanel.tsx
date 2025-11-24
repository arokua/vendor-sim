"use client";

import type { AlgorithmDebugInfo } from "@/app/lib/types";
import { formatDenom } from "@/app/lib/changeMaking";
import { MAX_NAIVE_CALLS } from "@/app/lib/changeMaking";

interface Props {
  debug?: AlgorithmDebugInfo;
}

export function AlgorithmDebugPanel({ debug }: Props) {
  if (!debug) return null;

  const { targetAmount, coinSet, dpTablePreview, trace, naive } = debug;

  return (
    <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-200">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-emerald-300">
          Algorithm Inner Workings
        </h2>
        <span className="text-[10px] text-slate-500">
          Target: {(targetAmount / 100).toFixed(2)} | Coin types:{" "}
          {coinSet.length}
        </span>
      </div>

      {/* Coin set */}
      <div className="mb-3">
        <h3 className="text-[11px] font-semibold text-slate-300 mb-1">
          Coin denominations in use
        </h3>
        <div className="flex flex-wrap gap-1">
          {coinSet.map((d) => (
            <span
              key={d}
              className="rounded-full bg-slate-800 px-2 py-1 text-[11px]"
            >
              {formatDenom(d)}
            </span>
          ))}
        </div>
      </div>

      {/* DP Table Preview */}
      <div className="mb-4">
        <h3 className="text-[11px] font-semibold text-slate-300 mb-1">
          DP table (preview)
        </h3>
        <p className="text-[10px] text-slate-500 mb-1">
          Each row shows whether an amount is reachable, how many coins are
          needed in the optimal bounded solution, and the last coin used.
        </p>
        <div className="max-h-48 overflow-auto rounded border border-slate-800">
          <table className="w-full text-[11px] border-collapse">
            <thead className="bg-slate-900/80 sticky top-0">
              <tr className="text-slate-300 border-b border-slate-700/60">
                <th className="px-2 py-1 text-left">Amount</th>
                <th className="px-2 py-1 text-right">Reachable</th>
                <th className="px-2 py-1 text-right">Min coins</th>
                <th className="px-2 py-1 text-right">Last coin</th>
              </tr>
            </thead>
            <tbody>
              {dpTablePreview.map((row) => (
                <tr
                  key={row.amount}
                  className="border-b border-slate-800/60 hover:bg-slate-900/60"
                >
                  <td className="px-2 py-1">
                    {(row.amount / 100).toFixed(2)}{" "}
                    <span className="text-slate-500">({row.amount}c)</span>
                  </td>
                  <td className="px-2 py-1 text-right">
                    {row.reachable ? "yes" : "no"}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {row.reachable ? row.minCoins : "—"}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {row.lastCoin != null ? formatDenom(row.lastCoin) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trace */}
      <div className="mb-4">
        <h3 className="text-[11px] font-semibold text-slate-300 mb-1">
          DP step trace
        </h3>
        <div className="max-h-40 overflow-auto rounded border border-slate-800 bg-slate-950/40 p-2">
          {trace.map((line, idx) => (
            <p key={idx} className="leading-snug mb-0.5 whitespace-pre-wrap">
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* Naive summary */}
      {naive && (
        <div className="border-t border-slate-800 pt-3 mt-2">
          <h3 className="text-[11px] font-semibold text-slate-300 mb-1">
            Naive recursion summary
          </h3>
          {!naive.enabled ? (
            <p className="text-[10px] text-slate-500">
              Naive comparison skipped for amount {naive.amountTried}c (over
              configured debug limit).
            </p>
          ) : (
            <ul className="text-[10px] text-slate-400 space-y-0.5">
              <li>Target: {naive.amountTried}c</li>
              <li>
                Result coins:{" "}
                {naive.resultCoins === null ? "no solution" : naive.resultCoins}
              </li>
              <li>Recursive calls: {naive.calls}</li>
              {naive.truncated && (
                <li className="text-amber-400">
                  Trace truncated after {MAX_NAIVE_CALLS} calls to protect
                  performance.
                </li>
              )}
              {naive.usageMap &&(<li>
                <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-slate-300">Naive usage breakdown</summary>
                    <pre className="text-[11px] text-slate-400 mt-2">
                    {Object.entries((naive.usageMap ?? {}) as Record<string, number>)
                        .sort((a, b) => Number(a[0]) - Number(b[0]))
                        .map(([den, count]) => `${den}c → ${count}x`)
                        .join("\n")}
                    </pre>
                </details>
              </li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
