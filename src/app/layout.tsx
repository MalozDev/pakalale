import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import SuppressExtensionErrors from "@/components/SuppressExtensionErrors";
import ContextMenuBlocker from "@/components/ContextMenuBlocker";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Pakalale — Your Local Trading Platform",
  description:
    "Connect with local shops across Lusaka's major trading areas. Find products, compare prices, and support your community.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" translate="no" className={`${inter.variable} dark h-full`} suppressHydrationWarning>
      <body className="min-h-full bg-background text-foreground antialiased">
        <SuppressExtensionErrors />
        <ContextMenuBlocker />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "oklch(0.185 0.01 260)",
              color: "oklch(0.985 0 0)",
              border: "1px solid oklch(0.28 0.01 260)",
            },
            success: {
              iconTheme: {
                primary: "#E09F3E",
                secondary: "#f1f5f9",
              },
            },
            error: {
              iconTheme: {
                primary: "#9E2A2B",
                secondary: "#f1f5f9",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
