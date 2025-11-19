import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Coin Change Visualizer",
  description: "Interactive bounded coin change DP visualizer"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
