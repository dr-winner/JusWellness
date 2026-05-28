"use client";

import { Phone, MapPin, Camera, MessageCircle, Send } from "lucide-react";
import { formatWhatsAppLink } from "@/lib/utils";

export default function Contact() {
  const whatsappLink = formatWhatsAppLink(
    "233551792710",
    "Hi! I'd like to place an order 🧃"
  );

  return (
    <section id="contact" className="relative py-24 sm:py-32 bg-brand-sand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Left: Info (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold tracking-widest uppercase text-brand-green">
                Get In Touch
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-brand-green-dark leading-[1.1]">
                Let&apos;s Talk
                <br />Juice
              </h2>
              <p className="text-gray-500 leading-relaxed">
                Whether it&apos;s a single bottle or catering for 200 —
                we&apos;ve got you. Reach out and let&apos;s make it happen.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: MapPin, label: "Location", value: "East Legon, Accra, Ghana" },
                { icon: Phone, label: "Phone", value: "+233 55 179 2710" },
                { icon: Camera, label: "Instagram", value: "@jus_wellness", href: "https://instagram.com/jus_wellness" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100">
                  <div className="w-11 h-11 bg-brand-green/5 rounded-xl flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-brand-green" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-brand-green hover:underline">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-7 py-4 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-green-500/20"
            >
              <MessageCircle className="w-5 h-5" />
              Order via WhatsApp
            </a>
          </div>

          {/* Right: Form (3 cols) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-xl shadow-gray-100/50 border border-gray-100">
              <div className="space-y-2 mb-8">
                <h3 className="text-2xl font-bold text-gray-900">
                  Quick Inquiry
                </h3>
                <p className="text-sm text-gray-400">
                  Fill this out and we&apos;ll get back to you within the hour.
                </p>
              </div>
              <form className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      placeholder="Kwame Asante"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+233 XX XXX XXXX"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Order Type
                  </label>
                  <select className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all text-sm bg-white">
                    <option>Retail (1-10 bottles)</option>
                    <option>Wholesale (10+ bottles)</option>
                    <option>Event / Catering</option>
                    <option>Weekly Subscription</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us what you need..."
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all text-sm resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="group w-full flex items-center justify-center gap-2 py-4 bg-brand-green text-white font-bold rounded-xl hover:bg-brand-green-dark transition-all duration-300"
                >
                  Send Inquiry
                  <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
