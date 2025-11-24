import { z } from "zod";
import type { ChangeRequest,CoinInput } from "./types";

export const coinSchema = z.object({
  denom: z.number().int().nonnegative(),
  count: z.number().int().nonnegative()
});

export const changeRequestSchema = z.object({
  cashRegister: z
    .array(coinSchema)
    .min(1, "At least one denomination is required")
    .max(64, "Too many denominations (max 64)"),
  paymentAmount: z
    .number()
    .int()
    .nonnegative()
    .max(1_000_000, "Payment amount too large")
});

export function validateChangeRequest(body: any): ChangeRequest {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request payload.");
  }

  if (!Array.isArray(body.cashRegister)) {
    throw new Error("cashRegister must be an array.");
  }

  const cashRegister = body.cashRegister
    .map((row : CoinInput) => ({
      denom: Number(row.denom),
      count: Number(row.count)
    }))
    .filter((r:CoinInput) => Number.isFinite(r.denom) && Number.isFinite(r.count));

  if (cashRegister.length === 0) {
    throw new Error("cashRegister cannot be empty.");
  }

  const paymentAmount = Number(body.paymentAmount);
  if (!Number.isFinite(paymentAmount) || paymentAmount < 0) {
    throw new Error("paymentAmount must be a non-negative number.");
  }

  // pass debug flag through untouched
  const debug = Boolean(body.debug);

  return { cashRegister, paymentAmount, debug };
}

export function roundToNearest5(amount: number): number {
  const lastDigit = amount % 10;

  if (lastDigit <= 2) {
    return amount - lastDigit;            // round down to 0
  }
  if (lastDigit <= 4) {
    return amount + (5 - lastDigit);       // round up to 5
  }
  if (lastDigit <= 7) {
    return amount - (lastDigit - 5);       // round down to 5
  }

  return amount + (10 - lastDigit);        // round up to 10
}
