import type { Product } from "../lib/types";

interface ProductGridProps {
  products: Product[];
  selected: Product | null;
  onSelect: (product: Product) => void;
}

export function ProductGrid({
  products,
  selected,
  onSelect
}: ProductGridProps) {
  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-3">Available Products</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((p) => {
          const isSelected = selected?.id === p.id;
          const isOut = p.stock <= 0;

          return (
            <div
              key={p.id}
              className={`
                rounded-xl p-4 flex flex-col justify-between h-full border transition-all
                ${isOut ? "opacity-40 cursor-not-allowed border-slate-800" : "cursor-pointer"}
                ${isSelected ? "border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]" : "border-slate-700 hover:border-emerald-300"}
                bg-slate-900/60
              `}
              onClick={() => !isOut && onSelect(p)}
            >
              <h3 className="font-semibold text-sm">{p.name}</h3>

              <p className="text-xs text-slate-400 mt-1">{p.description}</p>

              <div className="mt-2">
                <p className="font-bold text-emerald-300">
                  ${(p.price / 100).toFixed(2)}
                </p>

                <p className="text-[11px] text-slate-500">
                  Stock: {isOut ? "Out" : p.stock}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
