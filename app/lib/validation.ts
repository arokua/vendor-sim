import { z } from "zod";
import type { ChangeRequest } from "./types";

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

export function validateChangeRequest(json: unknown): ChangeRequest {
  const result = changeRequestSchema.safeParse(json);
  if (!result.success) {
    const message =
      result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") ||
      "Invalid request payload";
    throw new Error(message);
  }
  return result.data;
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
