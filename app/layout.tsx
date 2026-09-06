import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { validateEnv } from "@/lib/env";
import "./globals.css";

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
  const missingEnvVars = validateEnv();

  // If required live credentials are not yet configured on Vercel, render an explicit obsidian diagnostic screen
  // instead of crashing Node with an opaque 500 error / white screen.
  if (missingEnvVars.length > 0) {
    return (
      <html lang="en" className="dark">
        <body className="bg-[#050505] text-[#F5F5F7] min-h-screen flex items-center justify-center p-6 font-sans">
          <div className="max-w-xl w-full bg-[#0a0a0a] border border-white/15 rounded-2xl p-8 space-y-6 shadow-2xl text-left">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d4ff00] animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#d4ff00] font-bold">
                OBSYN // ENVIRONMENT SETUP REQUIRED
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black uppercase tracking-tight text-white">
                Credentials Missing on Vercel
              </h1>
              <p className="text-xs text-[#888888] leading-relaxed">
                The platform is in strict live-mode and requires real Clerk and Supabase credentials. The following environment variables are missing or unconfigured:
              </p>
            </div>

            <div className="bg-[#050505] border border-white/10 rounded-lg p-4 space-y-2">
              {missingEnvVars.map((v) => (
                <div key={v} className="flex items-center gap-2 font-mono text-xs text-red-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>{v}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-2 text-xs text-[#777777] leading-relaxed border-t border-white/10">
              <p>
                <strong className="text-white">How to fix this:</strong>
              </p>
              <ol className="list-decimal pl-5 space-y-1.5 text-[#aaaaaa]">
                <li>
                  Open your project on <strong className="text-white">Vercel</strong> &gt; <strong className="text-white">Settings</strong> &gt; <strong className="text-white">Environment Variables</strong>.
                </li>
                <li>Add the missing keys listed above.</li>
                <li>
                  Go to <strong className="text-white">Deployments</strong> &gt; click the three dots (<strong className="text-white">...</strong>) &gt; click <strong className="text-white">Redeploy</strong>.
                </li>
              </ol>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
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
