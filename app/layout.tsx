import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Providers } from "./providers";
import "./globals.css";

// Swap this import (and the --font-sans / --font-display variables in
// globals.css) to change the app's typeface everywhere at once.
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Kurd Rest — Since 2026",
  description: "A Pinterest-style feed for images, videos, and boards.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>
        <Providers>
          <Navbar />
          <main className="container py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
