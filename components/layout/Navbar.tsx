"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toggleCart, getItemCount } = useCartStore();
  const itemCount = getItemCount();

  const navLinks = [
    { name: "Catalogue", href: "/catalogue" },
    { name: "Custom Order", href: "/custom-order" },
    { name: "My Orders", href: "/orders" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/85 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2 text-2xl font-black tracking-[-0.07em] text-white transition-opacity hover:opacity-80"
        >
          <span className="inline-block w-2.5 h-2.5 bg-[#d4ff00] rounded-full mr-1 transform transition-transform group-hover:scale-125" />
          OBSYN
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-10">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors ${
                  isActive
                    ? "text-white font-semibold"
                    : "text-[#888888] hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Clerk Auth & Cart Trigger */}
        <div className="flex items-center space-x-6">
          {/* Clerk Auth Integration */}
          <div className="hidden sm:flex items-center">
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-8 h-8 border border-white/20",
                  },
                }}
              />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-xs uppercase tracking-[0.15em] text-[#888888] hover:text-white transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>

          {/* Cart Icon & Live Counter */}
          <button
            onClick={toggleCart}
            aria-label="Open Shopping Bag"
            className="relative p-2 text-white hover:text-[#d4ff00] transition-colors"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#d4ff00] text-[#050505] text-[10px] font-bold flex items-center justify-center animate-pulse-subtle">
                {itemCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#888888] hover:text-white"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#080808] px-6 py-8 space-y-6">
          <nav className="flex flex-col space-y-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-sm uppercase tracking-[0.2em] text-[#a0a0a0] hover:text-white"
              >
                <span>{link.name}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <SignedIn>
              <div className="flex items-center gap-3">
                <UserButton afterSignOutUrl="/" />
                <span className="text-xs text-[#888888] uppercase tracking-wider">Account Active</span>
              </div>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 text-center text-xs uppercase tracking-widest font-semibold bg-white text-black rounded hover:bg-neutral-200 transition-colors"
                >
                  Sign In with Google
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      )}
    </header>
  );
}
