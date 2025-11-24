export interface CoinInput {
  denom: number; // in cents
  count: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;          // in cents
  stock: number;
  description: string;
}

//---- API TYPES ----

export interface ChangeRequest {
  cashRegister: CoinInput[];
  paymentAmount: number;
  debug? : boolean | false;
}

export interface ChangeResponse {
  success: boolean;
  message?: string;
  change?: number[]; // list of denominations used (in cents)
  coinUsage?: Record<number, number>; // denom -> count used
  updatedRegister?: CoinInput[];
  debug?: AlgorithmDebugInfo;
}

// ---- DEBUG / SHOW PROCESS TYPES ----

export interface DpTableRow {
  amount: number;
  reachable: boolean;
  minCoins: number | null;
  lastCoin?: number | null;
}

export interface NaiveDebugSummary {
  enabled: boolean;
  amountTried: number;
  resultCoins: number | null;
  calls: number;
  truncated: boolean;
  usedCoins?: number[];
  usageMap?: Record<number, number>
}

export interface AlgorithmDebugInfo {
  targetAmount: number;
  coinSet: number[];
  registerSnapshot: CoinInput[];
  dpTablePreview: DpTableRow[];
  trace: string[];
  naive?: NaiveDebugSummary;
}