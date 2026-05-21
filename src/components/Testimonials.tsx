"use client";

import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Ama K.",
    role: "Fitness Coach, East Legon",
    text: "Jus has completely changed my morning routine. The Better Off Red is INSANE — I feel energized all day. Nothing else in Accra comes close to this level of freshness.",
    product: "Better Off Red",
    rating: 5,
  },
  {
    name: "Kofi M.",
    role: "Entrepreneur, Cantonments",
    text: "I was skeptical about juice delivery, but the freshness is real. You can taste the difference. My whole office orders every week now. The Take Me Higher is addictive.",
    product: "Take Me Higher",
    rating: 5,
  },
  {
    name: "Abena D.",
    role: "New Mom, Airport Residential",
    text: "The Ginger Shots got me through the rainy season without catching anything. Plus the delivery is always on time. The WhatsApp ordering makes it so easy!",
    product: "Ginger Shot",
    rating: 5,
  },
  {
    name: "Yaw B.",
    role: "Software Dev, Osu",
    text: "The Lover's Rock is my weekly treat. Creamy, filling, and actually good for you. I've replaced my afternoon coffee with Ginga Yourself — never going back.",
    product: "Lover's Rock",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative py-24 sm:py-32 bg-brand-green-dark overflow-hidden noise">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(45,106,79,0.3),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
          <div className="space-y-3">
            <p className="text-sm font-semibold tracking-widest uppercase text-brand-gold">
              Testimonials
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-[1.1]">
              Loved Across
              <br />Accra
            </h2>
          </div>
          <p className="text-white/40 max-w-sm text-sm leading-relaxed">
            Real reviews from real people. Join 500+ happy juice lovers who trust Jus for their daily wellness.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="group glass-dark rounded-3xl p-8 hover:bg-white/10 transition-all duration-500"
            >
              <div className="flex items-center gap-1 mb-5">
                {[...Array(t.rating)].map((_, j) => (
                  <Star
                    key={j}
                    className="w-4 h-4 fill-brand-gold text-brand-gold"
                  />
                ))}
              </div>

              <p className="text-white/85 text-lg leading-relaxed mb-8 font-light">
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="flex items-center justify-between border-t border-white/5 pt-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-gold/30 to-brand-green/30 flex items-center justify-center text-xs font-bold text-white">
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}</p>
                    <p className="text-xs text-white/40">{t.role}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-white/5 text-white/50 text-xs font-medium rounded-full border border-white/5">
                  {t.product}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
