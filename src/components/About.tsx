"use client";

export default function About() {
  return (
    <section id="about" className="relative py-24 sm:py-32 bg-white overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-sand/60 rounded-l-[80px] hidden lg:block" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: Visual */}
          <div className="relative">
            <div className="aspect-[4/5] max-w-md mx-auto rounded-[2rem] bg-gradient-to-br from-brand-charcoal to-brand-green overflow-hidden relative noise">
              <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-10 space-y-6">
                <p className="text-7xl sm:text-8xl">🌿</p>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-white">Our Story</p>
                  <p className="text-white/50 text-sm tracking-widest uppercase">
                    Est. Accra, Ghana
                  </p>
                </div>
                <div className="w-16 h-px bg-white/20" />
                <p className="text-white/60 text-sm italic leading-relaxed max-w-xs">
                  &ldquo;Beloved, I pray that all may go well with you and that
                  you may be in good health, as it goes well with your
                  soul.&rdquo;
                </p>
                <p className="text-brand-gold text-sm font-semibold">
                  III John 1:2
                </p>
              </div>
            </div>

            {/* Floating stat cards */}
            <div className="absolute -bottom-4 -left-4 sm:left-4 glass rounded-2xl px-6 py-4 shadow-xl animate-float">
              <p className="text-3xl font-black text-brand-green">500+</p>
              <p className="text-xs text-gray-500 font-medium">Happy Customers</p>
            </div>
            <div className="absolute -top-4 -right-4 sm:right-4 glass rounded-2xl px-6 py-4 shadow-xl animate-float delay-500">
              <p className="text-3xl font-black text-brand-gold">22</p>
              <p className="text-xs text-gray-500 font-medium">Unique Flavours</p>
            </div>
          </div>

          {/* Right: Copy */}
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold tracking-widest uppercase text-brand-green">
                About Jus
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-brand-green-dark leading-[1.1]">
                Wellness Is Not
                <br />a Trend. It&apos;s a
                <br />
                <span className="text-gradient">Lifestyle.</span>
              </h2>
            </div>

            <div className="space-y-5 text-gray-600 leading-relaxed">
              <p className="text-lg">
                Jus was born from a simple belief — <strong className="text-brand-green-dark">what you
                put into your body matters.</strong> We started juicing every day,
                sharing with friends, and the word spread.
              </p>
              <p>
                Now we&apos;re on a mission to bring fresh, honest nutrition to
                everyone in Accra. Every bottle is cold-pressed the same morning
                you receive it. We source the freshest fruits and vegetables, and
                we never add sugar, preservatives, or anything artificial.
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { value: "16", label: "Fresh Juices" },
                { value: "3", label: "Wellness Shots" },
                { value: "4", label: "Sizes Available" },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-4 bg-gray-50 rounded-2xl">
                  <p className="text-2xl font-bold text-brand-green-dark">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
