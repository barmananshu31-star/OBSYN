import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { validateEnv } from "@/lib/env";
import "./globals.css";

// Fail loudly on startup if production environment variables are missing
validateEnv();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "OBSYN // Archival Streetwear Monolith",
  description:
    "Premium high-contrast apparel engineered from archival heavyweight textiles. Buttery-smooth digital atelier.",
  keywords: ["streetwear", "heavyweight hoodie", "luxury apparel", "obsyn", "dark luxury", "monolith"],
  authors: [{ name: "OBSYN Studio" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#ffffff",
          colorBackground: "#0a0a0a",
          colorInputBackground: "#141414",
          colorInputText: "#ffffff",
          colorText: "#f5f5f7",
          colorTextSecondary: "#888888",
          borderRadius: "4px",
        },
        elements: {
          card: "border border-white/10 shadow-2xl",
          formButtonPrimary:
            "bg-white text-black hover:bg-[#d4ff00] hover:text-black uppercase tracking-widest text-xs font-bold transition-all",
          socialButtonsBlockButton:
            "border border-white/15 bg-white/5 hover:bg-white/10 text-white transition-all",
        },
      }}
    >
      <html lang="en" className="dark">
        <body className="bg-[#050505] text-[#F5F5F7] min-h-screen flex flex-col font-sans selection:bg-white selection:text-black">
          <SmoothScrollProvider>
            <Navbar />
            <CartDrawer />
            <main className="flex-1 pt-20">{children}</main>
            <Footer />
          </SmoothScrollProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
