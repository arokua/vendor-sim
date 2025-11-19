import { roundToNearest5 } from "../lib/validation";
import type { Product } from "../lib/types";

export function SelectedProductInfo({
  product,
  paymentAmount
}: {
  product: Product | null;
  paymentAmount: number;
}) {
  if (!product) return null;

  const change = Math.max(paymentAmount - product.price, 0);
  const rounded = roundToNearest5(change);

  return (
    <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/40 text-sm">
      <h3 className="font-semibold mb-2 text-emerald-300">Selected Product</h3>

      <p className="text-slate-300">{product.name}</p>

      <div className="mt-2 space-y-1 text-xs text-slate-400">
        <p>Price: ${(product.price / 100).toFixed(2)}</p>
        <p>Payment: ${(paymentAmount / 100).toFixed(2)}</p>
        <p>
          Change:{" "}
          <span className="text-emerald-300 font-semibold">
            ${(rounded / 100).toFixed(2)}
          </span>
        </p>
      </div>
    </div>
  );
}
