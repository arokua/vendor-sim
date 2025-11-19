# Coin Change Visualizer

An interactive **bounded coin change** visualizer built with **Next.js 14 + TypeScript**, showcasing a dynamic
programming algorithm that respects limited coin counts.

## Features

- Configure a cash register with arbitrary denominations and counts (in cents).
- Enter a target amount (e.g. `850` for `$8.50`).
- Backend API route (`POST /api/change`) runs a **bounded knapsack-style DP**:
  - Minimizes number of coins.
  - Respects per-denomination counts.
- Visual result:
  - Coin list used.
  - Per-denomination usage summary.
  - Updated cash register after change is dispensed.
- Tech stack:
  - Next.js 14 (App Router)
  - React 18
  - TypeScript (strict)
  - TailwindCSS
  - Zod (runtime validation)
  - SWR (data fetching)

## Getting Started

```bash
npm install
npm run dev
# then open http://localhost:3000
