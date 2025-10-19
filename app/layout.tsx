import React from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MediSwift - Pakistan's Leading Medical Marketplace",
  description: "Order authentic medicines and health products with fast, reliable delivery across Pakistan.",
  keywords: ["medicine", "pharmacy", "medical equipment", "Pakistan", "healthcare", "wholesale"],
  authors: [{ name: "MediSwift" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MediSwift",
  },
  openGraph: {
    title: "MediSwift - Pakistan's Leading Medical Marketplace",
    description: "Order authentic medicines and health products with fast, reliable delivery across Pakistan.",
    type: "website",
    siteName: "MediSwift",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#009CA6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable}`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
