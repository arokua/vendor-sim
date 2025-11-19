import type { CoinInput, Product } from "./types";

export function exportData(
  register: CoinInput[],
  products: Product[]
): string {
  let out = "# Coin Register (denom,count)\n";
  out += register
    .map(r => `${r.denom},${r.count}`)
    .join("\n");

  out += "\n\n# Products (id,name,price,stock)\n";
  out += products
    .map(p => `${p.id},${p.name},${p.price},${p.stock}`)
    .join("\n");

  out += "\n\n# Metadata\n";
  out += "rounding=nearest5\n";
  out += "version=1\n";

  return out;
}
