"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#products", label: "Menu" },
  { href: "#about", label: "About" },
  { href: "#testimonials", label: "Reviews" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar({ cartCount = 0 }: { cartCount?: number }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-sm shadow-black/5 border-b border-gray-100/50"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 font-bold text-sm",
                scrolled
                  ? "bg-brand-green text-white"
                  : "bg-white/10 text-white border border-white/20"
              )}
            >
              J
            </div>
            <span
              className={cn(
                "font-bold text-xl tracking-tight transition-colors duration-300",
                scrolled ? "text-brand-green-dark" : "text-white"
              )}
            >
              Jus
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300",
                  scrolled
                    ? "text-gray-600 hover:text-brand-green hover:bg-brand-green/5"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              className={cn(
                "relative p-2.5 rounded-xl transition-all duration-300",
                scrolled ? "hover:bg-gray-100" : "hover:bg-white/10"
              )}
            >
              <ShoppingBag
                className={cn(
                  "w-5 h-5 transition-colors",
                  scrolled ? "text-gray-700" : "text-white"
                )}
              />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              href="/shop"
              className={cn(
                "hidden md:inline-flex items-center px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300",
                scrolled
                  ? "bg-brand-green text-white hover:bg-brand-green-dark shadow-lg shadow-brand-green/20"
                  : "bg-white text-brand-green-dark hover:bg-brand-cream"
              )}
            >
              Order Now
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                "md:hidden p-2.5 rounded-xl transition-colors",
                scrolled ? "hover:bg-gray-100" : "hover:bg-white/10"
              )}
            >
              {mobileOpen ? (
                <X className={cn("w-5 h-5", scrolled ? "text-gray-900" : "text-white")} />
              ) : (
                <Menu className={cn("w-5 h-5", scrolled ? "text-gray-900" : "text-white")} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-400 ease-out",
          mobileOpen ? "max-h-80" : "max-h-0"
        )}
      >
        <div className="px-4 pb-6 pt-2 space-y-1 bg-white border-t border-gray-100 shadow-xl">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-brand-green hover:bg-brand-green/5 rounded-xl transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/shop"
            onClick={() => setMobileOpen(false)}
            className="block w-full text-center px-5 py-3.5 mt-3 bg-brand-green text-white font-semibold rounded-xl"
          >
            Order Now
          </Link>
        </div>
      </div>
    </nav>
  );
}
