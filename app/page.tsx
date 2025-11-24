"use client";

import { useState, useMemo } from "react";
import useSWRMutation from "swr/mutation";

import { CashRegisterEditor } from "./components/CashRegisterEditor";
import { AlgorithmInputForm } from "./components/AlgorithmInputForm";
import { AlgorithmDebugPanel } from "./components/AlgorithmDebugPanel";
import { ProductGrid } from "./components/ProductGrid";
import { SelectedProductInfo } from "./components/SelectProductInfo";
import { MachineStatePanel } from "./components/MachineStatePanel";
import { ChangeResult } from "./components/ChangeResult";

import { products as initialProducts } from "./data/products";
import { exportData } from "./lib/export";
import { importData } from "./lib/import";
import { roundToNearest5 } from "./lib/validation";

import type { Product, CoinInput, ChangeRequest, ChangeResponse } from "./lib/types";

async function postChange(url: string, { arg }: { arg: ChangeRequest }) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg)
  });
  return (await res.json()) as ChangeResponse;
}

const DEFAULT_REGISTER: CoinInput[] = [
  { denom: 5, count: 20 },
  { denom: 10, count: 40 },
  { denom: 20, count: 3 },
  { denom: 50, count: 5 },
  { denom: 100, count: 30 },
  { denom: 200, count: 20 },
  { denom: 500, count: 6 },
  { denom: 1000, count: 10 },
  { denom: 2000, count: 10 },
  { denom: 5000, count: 10 }
];

export default function Page() {
  const [dispensing, setDispensing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [rows, setRows] = useState<CoinInput[]>(DEFAULT_REGISTER);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(850);
  const [result, setResult] = useState<ChangeResponse | null>(null);

  const totalBalance = useMemo(
    () => rows.reduce((sum, r) => sum + r.denom * r.count, 0),
    [rows]
  );

  const { trigger, isMutating } = useSWRMutation("/api/change", postChange);

  const handleRun = async () => {
    setErrorMessage(null);
    setResult(null);
    setDispensing(false);

    if (!selectedProduct) return setErrorMessage("Please select a product.");
    if (selectedProduct.stock <= 0) return setErrorMessage("Product out of stock.");
    if (paymentAmount <= selectedProduct.price)
      return setErrorMessage("Payment must exceed product price.");

    const changeToGive = paymentAmount - selectedProduct.price;
    const roundedChange = roundToNearest5(changeToGive);

    if (totalBalance < roundedChange)
      return setErrorMessage(
        `Machine has insufficient balance ($${(totalBalance / 100).toFixed(2)})`
      );

    const sanitizedRows = rows.filter((r) => r.denom > 0 && r.count > 0);

    const response = await trigger({
      cashRegister: sanitizedRows,
      paymentAmount: roundedChange,
      debug: debugMode
    });

    if (!response.success) {
      setErrorMessage(response.message ?? "Unable to compute change.");
      return;
    }

    // update register
    if (response.updatedRegister) {
      setRows(response.updatedRegister);
      localStorage.setItem("register", JSON.stringify(response.updatedRegister));
    }

    // update product stock
    setProducts((prev) =>
      prev.map((p) =>
        p.id === selectedProduct.id ? { ...p, stock: p.stock - 1 } : p
      )
    );

    setDispensing(true);
    setTimeout(() => setDispensing(false), 1500);

    setResult(response);
    console.log("Change response:", response);
    console.log("Debug info:", response.debug);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Smart Vending Machine Simulator
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-2xl">
          Configure a cash register, purchase items, apply Australian rounding
          rules, compute optimal change, and import/export machine state.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-[1.2fr_1fr] mb-6">
        <CashRegisterEditor
          rows={rows}
          onChangeRow={(i, f, v) =>
            setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [f]: v } : row)))
          }
          onAddRow={() => setRows([...rows, { denom: 0, count: 0 }])}
          onRemoveRow={(i) => setRows(rows.filter((_, idx) => idx !== i))}
          totalBalance={totalBalance}
        />

        <MachineStatePanel
          rows={rows}
          products={products}
          onImport={(state) => {
            setRows(state.register);
            setProducts(state.products);
            setSelectedProduct(null);
          }}
        />

        <ProductGrid
          products={products}
          selected={selectedProduct}
          onSelect={setSelectedProduct}
        />

        <SelectedProductInfo
          product={selectedProduct}
          paymentAmount={paymentAmount}
        />

        <AlgorithmInputForm
          paymentAmount={paymentAmount}
          onChangePaymentAmount={setPaymentAmount}
          onSubmit={handleRun}
          onReset={() => setResult(null)}
          disabled={isMutating}
          isLoading={isMutating}
        />

        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            className="accent-emerald-500"
            checked={debugMode}
            onChange={(e) => setDebugMode(e.target.checked)}
          />
          <span>Show inner algorithm steps (Nerd mode)</span>
          <span className="text-[10px] text-slate-500">
            (Adds DP table + trace; may be truncated for large amounts.)
          </span>
        </label>

        {errorMessage && (
          <div className="rounded-xl border border-red-500/70 bg-red-950/40 p-3 text-xs text-red-100">
            <strong className="block mb-1">Input error</strong>
            <span>{errorMessage}</span>
          </div>
        )}
      </section>

      <section>
        {dispensing && (
          <div className="p-3 bg-emerald-900/40 border border-emerald-500 rounded-xl animate-pulse text-emerald-200 text-sm mb-4">
            Dispensing {selectedProduct?.name}...
          </div>
        )}

        {result && (
          <ChangeResult {...result} />
        )}
        {debugMode && <AlgorithmDebugPanel debug={result?.debug} />}

      </section>

      <footer className="mt-10 border-t border-slate-800 pt-4 text-[11px] text-slate-500">
        <p>
          Built with Next.js and React. Change-making DP algorithm based on the
          <a href="https://en.wikipedia.org/wiki/Change-making_problem">
            {" "}
            Wikipedia formulation
          </a>
          .
        </p>
        <p>
          Source code on 
          <a href="https://github.com/arokua/vendor-sim"> GitHub</a>. Created by <a href="#">Anh Tran</a>.
        </p>
      </footer>
    </main>
  );
}
