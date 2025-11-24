// app/lib/changeMaking.ts
import type {
  CoinInput,
  AlgorithmDebugInfo,
  DpTableRow,
  NaiveDebugSummary
} from "./types";

export interface DPResult {
  success: boolean;
  message?: string;
  change?: number[];
  coinUsage?: Record<number, number>;
  updatedRegister?: CoinInput[];
  debug?: AlgorithmDebugInfo;
}

const MAX_DEBUG_AMOUNT = 500;     // maximum DP table size preview
const MAX_TRACE_LINES = 120;      // cap trace length, prevent DOM spam
const MAX_NAIVE_AMOUNT = 8000;    // prevent super-heavy naive recursion
export const MAX_NAIVE_CALLS = 5000;

/**
 * True bounded coin change DP:
 *
 * dp[i][a] = minimum number of coins to make amount `a`
 *            using coins[0..i-1], each with limited count.
 *
 * We track parents to reconstruct which coins were actually used.
 */
export function computeChange(
  cashRegister: CoinInput[],
  paymentAmount: number,
  options?: { debug?: boolean }
): DPResult {
  const debugEnabled = options?.debug ?? false;

  if (paymentAmount === 0) {
    return {
      success: true,
      message: "No change required.",
      change: [],
      coinUsage: {},
      updatedRegister: cashRegister.map(c => ({ ...c })),
      debug: debugEnabled
        ? {
            targetAmount: paymentAmount,
            coinSet: cashRegister.map(c => c.denom),
            registerSnapshot: cashRegister.map(c => ({ ...c })),
            dpTablePreview: [],
            trace: ["Target amount is 0 – no DP needed."],
            naive: {
              enabled: false,
              amountTried: 0,
              resultCoins: 0,
              calls: 0,
              truncated: false
            }
          }
        : undefined
    };
  }

  if (cashRegister.length === 0) {
    return {
      success: false,
      message: "Cash register is empty."
    };
  }

  const totalAvailable = cashRegister.reduce(
    (sum, c) => sum + c.denom * c.count,
    0
  );
  if (totalAvailable < paymentAmount) {
    return {
      success: false,
      message: `Machine cannot provide change — insufficient total balance. Available: $${(
        totalAvailable / 100
      ).toFixed(2)}`
    };
  }

  const trace: string[] = [];
  const addTrace = (msg: string) => {
    if (!debugEnabled) return;
    if (trace.length < MAX_TRACE_LINES) {
      trace.push(msg);
    } else if (trace.length === MAX_TRACE_LINES) {
      trace.push("… trace truncated for brevity / performance.");
    }
  };

  // Sort by denom ascending for nicer tables
  const coins = [...cashRegister].sort((a, b) => a.denom - b.denom);
  const denoms = coins.map(c => c.denom);
  const counts = coins.map(c => c.count);
  const n = coins.length;

  const INF = 999999999;

  // dp[i][a] = min coins to make `a` using first i coin types (0..i-1)
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    Array(paymentAmount + 1).fill(INF)
  );

  // parent[i][a] = how we got here: prev row/amount and used count of coin i-1
  const parent: (null | { pi: number; pa: number; used: number })[][] =
    Array.from({ length: n + 1 }, () =>
      Array(paymentAmount + 1).fill(null)
    );

  // Base case: 0 coins, amount 0 = 0 coins used
  dp[0][0] = 0;
  parent[0][0] = { pi: 0, pa: 0, used: 0 };

  for (let i = 1; i <= n; i++) {
    const coin = denoms[i - 1];
    const maxCount = counts[i - 1];

    addTrace(`Processing coin ${coin}c (count=${maxCount})`);

    for (let amount = 0; amount <= paymentAmount; amount++) {
      // Option 1: don't use coin i-1 at all
      dp[i][amount] = dp[i - 1][amount];
      parent[i][amount] =
        dp[i - 1][amount] < INF
          ? { pi: i - 1, pa: amount, used: 0 }
          : null;

      // Option 2: use k copies of coin i-1 (bounded by maxCount)
      for (let k = 1; k <= maxCount; k++) {
        const prevAmt = amount - k * coin;
        if (prevAmt < 0) break;

        if (dp[i - 1][prevAmt] === INF) continue;

        const candidate = dp[i - 1][prevAmt] + k;
        if (candidate < dp[i][amount]) {
          dp[i][amount] = candidate;
          parent[i][amount] = { pi: i - 1, pa: prevAmt, used: k };
          addTrace(
            `amount ${amount}: using ${k} × ${coin}c (prev=${prevAmt}) → best=${candidate}`
          );
        }
      }
    }
  }

  if (dp[n][paymentAmount] === INF) {
    return {
      success: false,
      message: "Exact change not possible with current coin counts.",
      debug: debugEnabled
        ? {
            targetAmount: paymentAmount,
            coinSet: denoms,
            registerSnapshot: coins.map(c => ({ ...c })),
            dpTablePreview: buildDpPreview(dp, denoms, paymentAmount),
            trace,
            naive: maybeRunNaiveDebug(denoms, paymentAmount)
          }
        : undefined
    };
  }

  // ---- Backtrack to recover usage per coin type ----
  const usage = Array(n).fill(0);
  let i = n;
  let amt = paymentAmount;

  while (i > 0 && amt >= 0) {
    const p = parent[i][amt];
    if (!p) break;
    usage[i - 1] += p.used;
    amt = p.pa;
    i = p.pi;
  }

  // Build updated register + change list + coinUsage map
  const change: number[] = [];
  const coinUsage: Record<number, number> = {};

  const updatedRegister: CoinInput[] = coins.map((c, idx) => {
    const used = usage[idx];
    if (used > 0) {
      coinUsage[c.denom] = used;
      for (let k = 0; k < used; k++) {
        change.push(c.denom);
      }
    }
    return {
      denom: c.denom,
      count: c.count - used
    };
  });

  return {
    success: true,
    message: "Change computed successfully.",
    change,
    coinUsage,
    updatedRegister,
    debug: debugEnabled
      ? {
          targetAmount: paymentAmount,
          coinSet: denoms,
          registerSnapshot: coins.map(c => ({ ...c })),
          dpTablePreview: buildDpPreview(dp, denoms, paymentAmount),
          trace,
          naive: maybeRunNaiveDebug(denoms, paymentAmount)
        }
      : undefined
  };
}

function buildDpPreview(
  dp: number[][],
  denoms: number[],
  amount: number
): DpTableRow[] {
  const rows: DpTableRow[] = [];
  const maxAmount = Math.min(amount, MAX_DEBUG_AMOUNT);
  const n = denoms.length;

  for (let a = 0; a <= maxAmount; a++) {
    const val = dp[n][a];
    rows.push({
      amount: a,
      reachable: val < 999999999,
      minCoins: val < 999999999 ? val : null,
      lastCoin: null // could be filled by another parent-pass if you want
    });
  }

  return rows;
}

// naive change-making for debug; heavily capped
function maybeRunNaiveDebug(
  denoms: number[],
  amount: number
): NaiveDebugSummary {
  if (amount > MAX_NAIVE_AMOUNT) {
    return {
      enabled: false,
      amountTried: amount,
      resultCoins: null,
      calls: 0,
      truncated: true
    };
  }

  let calls = 0;
  let truncated = false;

  // memo[a] = minimum number of coins to form `a`
  const memo: Record<number, number> = {};

  // parent[a] = coin denomination chosen that leads to optimal solution
  const parent: Record<number, number | null> = {};

  function solve(a: number): number {
    calls++;
    if (calls > MAX_NAIVE_CALLS) {
      truncated = true;
      return Infinity;
    }

    if (a === 0) return 0;
    if (a < 0) return Infinity;

    if (memo[a] !== undefined) return memo[a];

    let best = Infinity;
    let bestCoin: number | null = null;

    for (const c of denoms) {
      const candidate = 1 + solve(a - c);
      if (candidate < best) {
        best = candidate;
        bestCoin = c;
      }
    }

    memo[a] = best;
    parent[a] = bestCoin;
    return best;
  }

  const result = solve(amount);
  const resultCoins = result === Infinity ? null : result;

  // ---- Reconstruct coins used ----
  let usedCoins: number[] = [];
  const usageMap: Record<number, number> = {};

  if (resultCoins !== null) {
    let a = amount;
    while (a > 0) {
      const coin = parent[a];
      if (!coin) break;
      usedCoins.push(coin);
      usageMap[coin] = (usageMap[coin] || 0) + 1;
      a -= coin;
    }
  }

  return {
    enabled: true,
    amountTried: amount,
    resultCoins,
    calls,
    truncated,
    usedCoins,
    usageMap
  };
}


/**
 * Helper for formatting cents into human-readable string.
 * E.g. 150 -> "$1.50", 50 -> "50c"
 */
export function formatDenom(denom: number): string {
  if (denom >= 100) {
    const dollars = (denom / 100).toFixed(2);
    return `$${dollars}`;
  }
  return `${denom}c`;
}