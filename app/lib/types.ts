export interface CoinInput {
  denom: number; // in cents
  count: number;
}

export interface ChangeRequest {
  cashRegister: CoinInput[];
  paymentAmount: number;
}

export interface ChangeResponse {
  success: boolean;
  message?: string;
  change?: number[]; // list of denominations used (in cents)
  coinUsage?: Record<number, number>; // denom -> count used
  updatedRegister?: CoinInput[];
}
export interface Product {
  id: string;
  name: string;
  price: number;          // in cents
  stock: number;
  description: string;
}