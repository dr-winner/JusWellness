"use client";

import { useState } from "react";
import { Phone, MapPin, Camera, MessageCircle, Send, CheckCircle2, X, Loader2 } from "lucide-react";
import { formatWhatsAppLink } from "@/lib/utils";
import { inquirySchema } from "@/lib/validations";
import { motion, AnimatePresence } from "framer-motion";

type OrderType = "Retail (1-10 bottles)" | "Wholesale (10+ bottles)" | "Event / Catering" | "Weekly Subscription";

export default function Contact() {
  const whatsappLink = formatWhatsAppLink(
    "233551792710",
    "Hi! I'd like to place an order 🧃"
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("Retail (1-10 bottles)");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError("");

    const parsed = inquirySchema.safeParse({
      name,
      phone,
      order_type: orderType,
      message: message || undefined,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit inquiry.");
      }

      setShowSuccessModal(true);
      setName("");
      setPhone("");
      setOrderType("Retail (1-10 bottles)");
      setMessage("");
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="relative py-24 sm:py-32 bg-brand-sand overflow-hidden">
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

              {submitError && (
                <div className="p-4 mb-6 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-2xl">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                      }}
                      placeholder="Kwame Asante"
                      className={`w-full px-4 py-3.5 rounded-xl border ${
                        errors.name ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:ring-brand-green/20 focus:border-brand-green"
                      } focus:ring-2 outline-none transition-all text-sm`}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                      }}
                      placeholder="e.g. 0551792710 or +233..."
                      className={`w-full px-4 py-3.5 rounded-xl border ${
                        errors.phone ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:ring-brand-green/20 focus:border-brand-green"
                      } focus:ring-2 outline-none transition-all text-sm`}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.phone}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Order Type
                  </label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value as OrderType)}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all text-sm bg-white"
                  >
                    <option value="Retail (1-10 bottles)">Retail (1-10 bottles)</option>
                    <option value="Wholesale (10+ bottles)">Wholesale (10+ bottles)</option>
                    <option value="Event / Catering">Event / Catering</option>
                    <option value="Weekly Subscription">Weekly Subscription</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (errors.message) setErrors((prev) => ({ ...prev, message: "" }));
                    }}
                    placeholder="Tell us what you need..."
                    className={`w-full px-4 py-3.5 rounded-xl border ${
                      errors.message ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:ring-brand-green/20 focus:border-brand-green"
                    } focus:ring-2 outline-none transition-all text-sm resize-none`}
                  />
                  {errors.message && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full flex items-center justify-center gap-2 py-4 bg-brand-green text-white font-bold rounded-xl hover:bg-brand-green-dark transition-all duration-300 disabled:bg-brand-green/70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Send Inquiry
                      <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-8 text-center shadow-2xl z-10"
            >
              <button
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-16 h-16 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h3 className="text-2xl font-bold text-brand-green-dark mb-3">
                Inquiry Sent!
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Thank you for reaching out! We have received your inquiry and will review it immediately. One of our team members will contact you on WhatsApp or call you within the hour.
              </p>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3.5 bg-brand-green hover:bg-brand-green-dark text-white font-bold rounded-xl transition-colors shadow-lg shadow-brand-green/20"
              >
                Awesome, thank you!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
