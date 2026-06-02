import Link from "next/link";
import { Camera, Phone, MapPin, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-brand-charcoal text-white relative noise">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10">
          {/* Brand */}
          <div className="space-y-5 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                <span className="text-white font-bold text-sm">J</span>
              </div>
              <span className="font-bold text-xl tracking-tight">Jus</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Fresh cold-pressed juices made daily in East Legon, Accra. 
              No additives. No preservatives. Just pure wellness.
            </p>
            <p className="text-white/20 text-xs italic">
              III John 1:2
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h4 className="font-semibold text-xs uppercase tracking-[0.2em] text-white/50">
              Navigate
            </h4>
            <div className="space-y-3">
              {[
                { href: "/shop", label: "Shop All" },
                { href: "#about", label: "Our Story" },
                { href: "#testimonials", label: "Reviews" },
                { href: "#contact", label: "Contact" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="group flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
                >
                  {link.label}
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>

          {/* Products */}
          <div className="space-y-5">
            <h4 className="font-semibold text-xs uppercase tracking-[0.2em] text-white/50">
              Products
            </h4>
            <div className="space-y-3">
              {["Fresh Juices (16)", "Coconut Drinks (3)", "Wellness Shots (3)", "Mashke (1)"].map((item) => (
                <span key={item} className="block text-sm text-white/40">{item}</span>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-5">
            <h4 className="font-semibold text-xs uppercase tracking-[0.2em] text-white/50">
              Reach Us
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-sm text-white/40">
                <MapPin className="w-4 h-4 shrink-0" />
                East Legon, Accra
              </div>
              <div className="flex items-center gap-2.5 text-sm text-white/40">
                <Phone className="w-4 h-4 shrink-0" />
                +233 55 179 2710
              </div>
              <a
                href="https://instagram.com/jus_wellness"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-white/40 hover:text-white transition-colors"
              >
                <Camera className="w-4 h-4 shrink-0" />
                @jus_wellness
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} Jus Wellness. All rights reserved.
          </p>
          <p className="text-xs text-white/25">
            Made with 💚 in Accra, Ghana
          </p>
        </div>
      </div>
    </footer>
  );
}
