"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTABanner() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-green via-brand-green-light to-brand-green-dark" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(232,168,56,0.1),transparent_40%)]" />

      {/* Floating elements */}
      <div className="absolute top-10 left-10 text-6xl opacity-20 animate-float">🧃</div>
      <div className="absolute bottom-10 right-10 text-5xl opacity-15 animate-float delay-700">🥥</div>
      <div className="absolute top-1/2 right-1/4 text-4xl opacity-10 animate-float delay-300">⚡</div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
        <div className="space-y-6">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1]">
            Your Body Deserves
            <br />
            <span className="text-brand-gold-light">Better Fuel.</span>
          </h2>
          <p className="text-lg sm:text-xl text-white/70 max-w-xl mx-auto font-light leading-relaxed">
            Join hundreds of Accra residents who start their day with Jus.
            Order before 10am for same-day delivery.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/shop"
            className="group inline-flex items-center justify-center gap-3 px-10 py-4.5 bg-brand-orange text-white font-bold text-lg rounded-full hover:bg-brand-gold transition-all duration-300 hover:scale-[1.03] shadow-2xl shadow-brand-orange/30"
          >
            Shop Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="https://wa.me/233551792710?text=Hi!%20I'd%20like%20to%20know%20more%20about%20Jus%20🧃"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 px-10 py-4.5 border-2 border-white/30 text-white font-bold text-lg rounded-full hover:bg-white/10 transition-all duration-300"
          >
            Chat on WhatsApp
          </a>
        </div>

        <p className="text-sm text-white/40">
          🚚 Free delivery on orders above GHS 100 · 📍 Delivering across Accra
        </p>
      </div>
    </section>
  );
}
