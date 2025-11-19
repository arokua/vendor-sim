import type { CoinInput } from "./types";

export interface DPResult {
  success: boolean;
  message?: string;
  change?: number[];
  coinUsage?: Record<number, number>;
  updatedRegister?: CoinInput[];
}

/**
 * Bounded coin change: finds a combination of coins that exactly sums to paymentAmount,
 * using each coin at most its available count. Minimizes number of coins.
 *
 * Time complexity (worst-case): O(n * paymentAmount * maxCount)
 */
export function computeChange(
  cashRegister: CoinInput[],
  paymentAmount: number
): DPResult {
  if (paymentAmount === 0) {
    return {
      success: true,
      message: "No change required.",
      change: [],
      coinUsage: {},
      updatedRegister: [...cashRegister]
    };
  }

  if (cashRegister.length === 0) {
    return {
      success: false,
      message: "Cash register is empty."
    };
  }

  const coins = [...cashRegister].sort((a, b) => a.denom - b.denom);
  const n = coins.length;

  // dp[amount] = usage array or null if unreachable
  type Usage = number[];

  const dp: (Usage | null)[] = Array(paymentAmount + 1).fill(null);
  dp[0] = Array(n).fill(0);
  // Make sure there is enough total money
  const totalAvailable = cashRegister.reduce(
    (sum, c) => sum + c.denom * c.count,
    0
  );

  if (totalAvailable < paymentAmount) {
    return {
      success: false,
      message: `The machine does not have enough money to return change. 
  Current balance: $${(totalAvailable / 100).toFixed(2)}`
    };
  }
  // Bounded knapsack style: for each coin type, iterate count times
  for (let i = 0; i < n; i++) {
    const denom = coins[i].denom;
    const count = coins[i].count;

    // If denom is 0, skip to avoid infinite loop / nonsense
    if (denom <= 0) continue;

    // Apply coin at most 'count' times
    for (let used = 0; used < count; used++) {
      // Backward iteration to prevent reusing the same coin more than allowed
      for (let amount = paymentAmount; amount >= denom; amount--) {
        const prev = dp[amount - denom];
        if (!prev) continue;

        const prevUsage = [...prev];
        if (prevUsage[i] + 1 > count) continue;

        const candidateUsage = [...prevUsage];
        candidateUsage[i]++;

        const existing = dp[amount];

        if (!existing) {
          dp[amount] = candidateUsage;
        } else {
          const existingCoins = existing.reduce((sum, c) => sum + c, 0);
          const candidateCoins = candidateUsage.reduce((sum, c) => sum + c, 0);
          if (candidateCoins < existingCoins) {
            dp[amount] = candidateUsage;
          }
        }
      }
    }
  }

  const usage = dp[paymentAmount];
  if (!usage) {
    return {
      success: false,
      message: "Not possible to provide exact change with current coin counts."
    };
  }

  // Build response: list of coins used, usage per denom, updated register
  const coinUsage: Record<number, number> = {};
  const updatedRegister: CoinInput[] = coins.map((c) => ({ ...c }));

  const change: number[] = [];

  for (let i = 0; i < n; i++) {
    const usedCount = usage[i];
    if (usedCount <= 0) continue;

    const denom = coins[i].denom;
    coinUsage[denom] = usedCount;

    if (updatedRegister[i].count < usedCount) {
      // Defensive check (should not happen if DP is correct)
      return {
        success: false,
        message: "Internal error: DP solution exceeds available coin counts."
      };
    }

    updatedRegister[i].count -= usedCount;

    for (let k = 0; k < usedCount; k++) {
      change.push(denom);
    }
  }

  return {
    success: true,
    message: "Change computed successfully.",
    change,
    coinUsage,
    updatedRegister
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