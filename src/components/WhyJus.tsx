"use client";

import { Droplets, Truck, Clock, Heart } from "lucide-react";

const features = [
  {
    icon: Droplets,
    title: "Cold-Pressed",
    stat: "100%",
    description: "Every bottle is cold-pressed to preserve nutrients. Never heated, never pasteurised.",
    gradient: "from-green-500/10 to-green-600/5",
    iconColor: "text-green-600",
  },
  {
    icon: Clock,
    title: "Made Daily",
    stat: "6AM",
    description: "We start juicing at dawn. By the time you order, it's only hours old.",
    gradient: "from-brand-gold/10 to-yellow-500/5",
    iconColor: "text-brand-gold",
  },
  {
    icon: Truck,
    title: "Same-Day",
    stat: "3HR",
    description: "Order by 10am, delivered by afternoon. All across Accra.",
    gradient: "from-blue-500/10 to-blue-600/5",
    iconColor: "text-blue-600",
  },
  {
    icon: Heart,
    title: "No Additives",
    stat: "0%",
    description: "Zero sugar. Zero preservatives. Zero artificial anything. Just fruit.",
    gradient: "from-red-500/10 to-red-600/5",
    iconColor: "text-red-500",
  },
];

export default function WhyJus() {
  return (
    <section className="relative py-24 sm:py-32 bg-brand-cream/50">
      {/* Decorative */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-green/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <p className="text-sm font-semibold tracking-widest uppercase text-brand-gold">
            The Jus Difference
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-brand-green-dark">
            Not Just Another Juice
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${feature.gradient} p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 border border-white/60`}
            >
              {/* Large stat */}
              <p className="text-5xl font-black text-brand-green-dark/8 absolute top-4 right-5 select-none">
                {feature.stat}
              </p>

              <div className="relative space-y-4">
                <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                <h3 className="font-bold text-lg text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
