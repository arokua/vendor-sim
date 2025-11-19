"use client";

import type { CoinInput } from "@/app/lib/types";
import { formatDenom } from "@/app/lib/changeMaking";

interface Props {
  success?: boolean | null;
  message?: string;
  change?: number[];
  coinUsage?: Record<number, number>;
  updatedRegister?: CoinInput[];
}


export function ChangeResult(props: Props) {
  const { success, message, change, coinUsage, updatedRegister } = props;

  if (success === null) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-4 text-sm text-slate-400">
        Results will appear here after you run the algorithm.
      </div>
    );
  }

  const baseClasses =
    "rounded-2xl border p-4 text-sm shadow-lg transition-colors";
  const classes = success
    ? `${baseClasses} border-emerald-500/70 bg-emerald-950/40 text-emerald-100 shadow-emerald-500/20`
    : `${baseClasses} border-red-500/70 bg-red-950/30 text-red-100 shadow-red-500/20`;

  return (
    <div className={classes}>
      <h2 className="text-base font-semibold mb-2">
        {success ? "Change computation successful" : "Change computation failed"}
      </h2>
      {message && <p className="mb-3 text-xs opacity-90">{message}</p>}

      {success && change && change.length > 0 && (
        <>
          <div className="mb-3">
            <h3 className="text-xs font-semibold uppercase text-emerald-200/80 mb-1">
              Change returned
            </h3>
            <div className="flex flex-wrap gap-1 text-xs">
              {change.map((denom, idx) => (
                <span
                  key={`${denom}-${idx}`}
                  className="rounded-full bg-emerald-500/15 px-2 py-1"
                >
                  {formatDenom(denom)}
                </span>
              ))}
            </div>
          </div>

          {coinUsage && (
            <div className="mb-3">
              <h3 className="text-xs font-semibold uppercase text-emerald-200/80 mb-1">
                Coin usage summary
              </h3>
              <table className="w-full text-[11px] border-collapse">
                <thead>
                  <tr className="text-emerald-200/70 border-b border-emerald-500/30">
                    <th className="text-left py-1 pr-2">Denom</th>
                    <th className="text-right py-1 pr-2">Used</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(coinUsage)
                    .sort((a, b) => Number(a[0]) - Number(b[0]))
                    .map(([denomStr, used]) => (
                      <tr key={denomStr} className="border-b border-slate-700/40">
                        <td className="py-1 pr-2">
                          {formatDenom(Number(denomStr))}
                        </td>
                        <td className="py-1 pr-2 text-right">{used}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {updatedRegister && (
            <div>
              <h3 className="text-xs font-semibold uppercase text-emerald-200/80 mb-1">
                Updated cash register
              </h3>
              <table className="w-full text-[11px] border-collapse">
                <thead>
                  <tr className="text-emerald-200/70 border-b border-emerald-500/30">
                    <th className="text-left py-1 pr-2">Denom</th>
                    <th className="text-right py-1 pr-2">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {updatedRegister
                    .slice()
                    .sort((a, b) => a.denom - b.denom)
                    .map((c) => (
                      <tr
                        key={c.denom}
                        className="border-b border-slate-700/40"
                      >
                        <td className="py-1 pr-2">{formatDenom(c.denom)}</td>
                        <td className="py-1 pr-2 text-right">{c.count}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {success === false && (
  <p className="mt-1 text-[11px] opacity-75">
    Try adjusting the payment amount or adding more coins to the register.
  </p>
)}

    </div>
  );
}
