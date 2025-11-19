import type { CoinInput, Product } from "./types";

export function importData(text: string): {
  register: CoinInput[];
  products: Product[];
} {
  const lines = text.split(/\r?\n/).map(l => l.trim());
  let mode: "register" | "products" | "meta" | null = null;

  const register: CoinInput[] = [];
  const products: Product[] = [];

  for (const line of lines) {
    if (!line || line.startsWith("//")) continue;

    if (line.startsWith("# Coin Register")) {
      mode = "register";
      continue;
    }
    if (line.startsWith("# Products")) {
      mode = "products";
      continue;
    }
    if (line.startsWith("# Metadata")) {
      mode = "meta";
      continue;
    }

    if (mode === "register") {
      const [d, c] = line.split(",");
      if (d && c) register.push({ denom: Number(d), count: Number(c) });
    }

    if (mode === "products") {
      const [id, name, price, stock] = line.split(",");
      if (id && name && price && stock) {
        products.push({
          id,
          name,
          price: Number(price),
          description: "",
          stock: Number(stock)
        });
      }
    }
  }

  return { register, products };
}
