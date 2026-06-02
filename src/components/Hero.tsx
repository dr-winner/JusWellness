import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Leaf, Sparkles, ChevronDown } from "lucide-react";

const marqueeItems = [
  "Better Off Red",
  "Take Me Higher",
  "Beach Body",
  "Lover's Rock",
  "Ms Fit",
  "Ginger Shot",
  "The Joy",
  "Citrus Kick",
  "Sun Kissed",
  "Coconut Chia",
];

export default function Hero() {
  return (
    <section className="relative min-h-[92svh] flex flex-col overflow-hidden bg-gradient-to-br from-brand-charcoal via-brand-green-dark to-brand-charcoal">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_20%_50%,rgba(91,171,128,0.2),transparent_60%)]" />
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_80%_20%,rgba(232,168,56,0.12),transparent_50%)]" />
        <div className="absolute bottom-0 left-1/2 w-full h-1/2 bg-[radial-gradient(ellipse_at_50%_100%,rgba(58,125,92,0.3),transparent_70%)]" />
      </div>

      {/* Main content */}
      <div className="relative flex-1 flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">
          {/* Left */}
          <div className="space-y-8">
            <div className="animate-fade-in-up opacity-0">
              <div className="inline-flex items-center gap-2 px-4 py-2 glass-dark rounded-full">
                <Leaf className="w-3.5 h-3.5 text-brand-sage" />
                <span className="text-xs font-semibold tracking-widest uppercase text-brand-sage">
                  No additives · Fresh daily · East Legon
                </span>
              </div>
            </div>

            <h1 className="animate-fade-in-up opacity-0 delay-100 text-5xl sm:text-6xl lg:text-[5rem] font-bold leading-[1.05] tracking-tight">
              <span className="text-white">We Juice</span>
              <br />
              <span className="text-white">Every Day —</span>
              <br />
              <span className="text-gradient bg-gradient-to-r from-brand-gold via-brand-orange to-brand-gold bg-clip-text text-transparent">
                Fresh Fresh.
              </span>
            </h1>

            <p className="animate-fade-in-up opacity-0 delay-200 text-lg sm:text-xl text-white/60 max-w-md leading-relaxed font-light">
              Cold-pressed juices, coconut drinks & wellness shots. Made with real
              fruit, delivered same-day across Accra.
            </p>

            <div className="animate-fade-in-up opacity-0 delay-300 flex flex-col sm:flex-row gap-4">
              <Link
                href="/shop"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-brand-orange text-white font-bold text-lg rounded-full hover:bg-brand-gold transition-all duration-300 hover:scale-[1.03] shadow-2xl shadow-brand-orange/30"
              >
                Order Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://wa.me/233551792710?text=Hi!%20I'd%20like%20to%20order%20some%20juice%20🧃"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-white/20 text-white font-semibold text-lg rounded-full hover:bg-white/10 transition-all duration-300"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.67-1.397A11.932 11.932 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.94 9.94 0 01-5.382-1.573l-.376-.228-2.774.83.753-2.857-.237-.381A9.935 9.935 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
                WhatsApp Us
              </a>
            </div>

            {/* Social proof */}
            <div className="animate-fade-in-up opacity-0 delay-400 flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {["🟤", "🟡", "🟠", "🔵"].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-peach to-brand-sage border-2 border-brand-charcoal flex items-center justify-center text-[10px] font-bold text-brand-charcoal"
                    >
                      {["AK", "KM", "EO", "YB"][i]}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-white/50">
                  <strong className="text-white">500+</strong> happy customers
                </span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-gold" />
                <span className="text-sm text-white/50">
                  <strong className="text-white">4.9</strong> rated
                </span>
              </div>
            </div>
          </div>

          {/* Right — Product showcase */}
          <div className="relative hidden lg:flex items-center justify-center animate-scale-in opacity-0 delay-300">
            <div className="relative w-[420px] h-[420px]">
              {/* Spinning ring */}
              <div className="absolute inset-0 rounded-full border border-white/5 animate-spin-slow" />
              <div className="absolute inset-4 rounded-full border border-dashed border-white/8" />

              {/* Center content with beautiful generated image */}
              <div className="absolute inset-10 rounded-full overflow-hidden border border-white/10 shadow-2xl bg-brand-charcoal/40 group">
                <Image
                  src="/hero-juice.png"
                  alt="Premium Cold-Pressed Juices"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                  sizes="420px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end pb-8 px-6 text-center">
                  <p className="text-white font-bold text-xl tracking-tight">Vibrant & Fresh</p>
                  <p className="text-brand-gold text-sm font-semibold">Made Daily in Accra</p>
                </div>
              </div>

              {/* Orbiting product badges */}
              {[
                { name: "Ginger Shot", emoji: "⚡", pos: "top-0 left-1/2 -translate-x-1/2 -translate-y-2" },
                { name: "Coconut", emoji: "🥥", pos: "right-0 top-1/2 -translate-y-1/2 translate-x-2" },
                { name: "Lover's Rock", emoji: "💛", pos: "bottom-0 left-1/2 -translate-x-1/2 translate-y-2" },
                { name: "Better Off Red", emoji: "❤️", pos: "left-0 top-1/2 -translate-y-1/2 -translate-x-2" },
              ].map((item, i) => (
                <div
                  key={item.name}
                  className={`absolute ${item.pos} animate-fade-in-up opacity-0`}
                  style={{ animationDelay: `${600 + i * 100}ms` }}
                >
                  <div className="glass-dark rounded-2xl px-4 py-2.5 flex items-center gap-2 shadow-xl hover:scale-105 transition-transform cursor-default">
                    <span className="text-lg">{item.emoji}</span>
                    <span className="text-xs font-semibold text-white whitespace-nowrap">{item.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Marquee ticker */}
      <div className="relative border-t border-white/5 bg-black/20">
        <div className="overflow-hidden py-4">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="mx-6 text-sm font-medium text-white/30 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-gold/50" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 animate-fade-in opacity-0 delay-1000">
        <a href="#products" className="flex flex-col items-center gap-2 text-white/30 hover:text-white/60 transition-colors">
          <span className="text-xs tracking-widest uppercase">Explore</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </a>
      </div>
    </section>
  );
}
