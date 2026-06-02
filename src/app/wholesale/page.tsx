"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { logWholesale } from "@/lib/sheets";
import { products, categories } from "@/lib/products";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Package,
  TrendingUp,
  Truck,
  Shield,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

const WHATSAPP_NUMBER = "233551792710";

const businessTypes = [
  "Restaurant / Cafe",
  "Hotel / Hospitality",
  "Gym / Fitness Center",
  "Supermarket / Shop",
  "Office / Corporate",
  "Events / Catering",
  "Other",
];

const benefits = [
  {
    icon: TrendingUp,
    title: "Bulk Pricing",
    description: "Competitive wholesale rates for regular orders",
  },
  {
    icon: Truck,
    title: "Reliable Delivery",
    description: "Scheduled deliveries across Greater Accra",
  },
  {
    icon: Shield,
    title: "Freshness Guarantee",
    description: "Made fresh daily — we never compromise on quality",
  },
  {
    icon: Package,
    title: "Custom Orders",
    description: "Tailored packages for your business needs",
  },
];

interface FormData {
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  location: string;
  businessType: string;
  products: string[];
  weeklyVolume: string;
  message: string;
}

const initialForm: FormData = {
  businessName: "",
  contactName: "",
  phone: "",
  email: "",
  location: "",
  businessType: "",
  products: [],
  weeklyVolume: "",
  message: "",
};

export default function WholesalePage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const set = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const toggleProduct = (productName: string) => {
    setForm((prev) => ({
      ...prev,
      products: prev.products.includes(productName)
        ? prev.products.filter((p) => p !== productName)
        : [...prev.products, productName],
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.businessName.trim()) newErrors.businessName = "Required";
    if (!form.contactName.trim()) newErrors.contactName = "Required";
    if (!form.phone.trim()) {
      newErrors.phone = "Required";
    } else if (!/^\+?233[0-9]{9}$|^0[0-9]{9}$/.test(form.phone.trim())) {
      newErrors.phone = "Enter a valid Ghana number";
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "Enter a valid email";
    }
    if (!form.businessType) newErrors.businessType = "Select your business type";
    if (form.products.length === 0) newErrors.products = "Select at least one product";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildWhatsAppMessage = (): string => {
    const lines = [
      `🏢 *WHOLESALE INQUIRY — Jus Wellness*`,
      ``,
      `*Business:* ${form.businessName.trim()}`,
      `*Contact:* ${form.contactName.trim()}`,
      `*Phone:* ${form.phone.trim()}`,
      form.email.trim() ? `*Email:* ${form.email.trim()}` : null,
      `*Location:* ${form.location.trim() || "Not specified"}`,
      `*Type:* ${form.businessType}`,
      ``,
      `*Products Interested In:*`,
      ...form.products.map((p) => `• ${p}`),
      ``,
      form.weeklyVolume ? `*Est. Weekly Volume:* ${form.weeklyVolume}` : null,
      form.message.trim() ? `*Message:* ${form.message.trim()}` : null,
      ``,
      `Hi! We're interested in wholesale partnership. Please share your wholesale pricing and terms. 🤝`,
    ];
    return lines.filter(Boolean).join("\n");
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const message = buildWhatsAppMessage();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setSubmitted(true);

    // Fire-and-forget: log to Google Sheet
    logWholesale({
      businessName: form.businessName.trim(),
      contactName: form.contactName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      location: form.location.trim(),
      businessType: form.businessType,
      products: form.products.join(", "),
      weeklyVolume: form.weeklyVolume,
      message: form.message.trim(),
    });
  };

  if (submitted) {
    return (
      <>
        <Navbar />
        <main className="pt-24 pb-16 min-h-screen bg-brand-sand/50">
          <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 space-y-6"
            >
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-brand-green-dark">
                Request Sent! 🤝
              </h1>
              <p className="text-gray-500 leading-relaxed max-w-sm mx-auto">
                Your wholesale inquiry has been sent via WhatsApp. Our team will
                review and get back to you within 24 hours with pricing and terms.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm(initialForm);
                  }}
                  className="flex-1 px-6 py-3.5 bg-brand-green text-white font-bold rounded-xl hover:bg-brand-green-dark transition-colors"
                >
                  Submit Another Request
                </button>
                <a
                  href="/"
                  className="flex-1 inline-flex items-center justify-center px-6 py-3.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Back Home
                </a>
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 min-h-screen bg-brand-sand/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center space-y-4 mb-12 pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-green/5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-brand-green" />
              <span className="text-xs font-semibold tracking-widest uppercase text-brand-green">
                Wholesale Partnership
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-brand-green-dark">
              Grow With Jus
            </h1>
            <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
              Bring the freshest cold-pressed juices to your business. Bulk
              pricing, reliable delivery, and freshness you can trust.
            </p>
          </div>

          {/* Benefits grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 space-y-3"
              >
                <div className="w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center">
                  <b.icon className="w-5 h-5 text-brand-green" />
                </div>
                <h3 className="font-bold text-gray-900">{b.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {b.description}
                </p>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Request Wholesale Pricing
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Fill in your details and we&apos;ll send you our wholesale catalog
                </p>
              </div>

              {/* Business Name */}
              <div>
                <label
                  htmlFor="ws-business"
                  className="block text-xs font-semibold text-gray-500 mb-1"
                >
                  Business Name *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="ws-business"
                    type="text"
                    value={form.businessName}
                    onChange={(e) => set("businessName", e.target.value)}
                    placeholder="e.g. FitLife Gym"
                    maxLength={100}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors.businessName ? "border-red-400" : "border-gray-200"} focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none text-sm`}
                  />
                </div>
                {errors.businessName && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.businessName}
                  </p>
                )}
              </div>

              {/* Contact Name */}
              <div>
                <label
                  htmlFor="ws-contact"
                  className="block text-xs font-semibold text-gray-500 mb-1"
                >
                  Contact Person *
                </label>
                <input
                  id="ws-contact"
                  type="text"
                  value={form.contactName}
                  onChange={(e) => set("contactName", e.target.value)}
                  placeholder="Your full name"
                  maxLength={100}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.contactName ? "border-red-400" : "border-gray-200"} focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none text-sm`}
                />
                {errors.contactName && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.contactName}
                  </p>
                )}
              </div>

              {/* Phone + Email row */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="ws-phone"
                    className="block text-xs font-semibold text-gray-500 mb-1"
                  >
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="ws-phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="0551234567"
                      maxLength={15}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors.phone ? "border-red-400" : "border-gray-200"} focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none text-sm`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="ws-email"
                    className="block text-xs font-semibold text-gray-500 mb-1"
                  >
                    Email{" "}
                    <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="ws-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="you@business.com"
                      maxLength={100}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors.email ? "border-red-400" : "border-gray-200"} focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none text-sm`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="ws-location"
                  className="block text-xs font-semibold text-gray-500 mb-1"
                >
                  Business Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="ws-location"
                    type="text"
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                    placeholder="e.g. Osu, Oxford Street"
                    maxLength={200}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none text-sm"
                  />
                </div>
              </div>

              {/* Business Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  Business Type *
                </label>
                <div className="flex flex-wrap gap-2">
                  {businessTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => set("businessType", type)}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                        form.businessType === type
                          ? "bg-brand-green/10 border-brand-green text-brand-green"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                {errors.businessType && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.businessType}
                  </p>
                )}
              </div>

              {/* Product selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  Products You&apos;re Interested In *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {products.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleProduct(p.name)}
                      className={`px-3 py-2.5 text-xs font-medium rounded-xl border text-left transition-all ${
                        form.products.includes(p.name)
                          ? "bg-brand-green/10 border-brand-green text-brand-green"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                {errors.products && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.products}
                  </p>
                )}
              </div>

              {/* Weekly volume */}
              <div>
                <label
                  htmlFor="ws-volume"
                  className="block text-xs font-semibold text-gray-500 mb-1"
                >
                  Estimated Weekly Volume
                </label>
                <select
                  id="ws-volume"
                  value={form.weeklyVolume}
                  onChange={(e) => set("weeklyVolume", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none text-sm bg-white"
                >
                  <option value="">Select volume range</option>
                  <option value="10-50 bottles">10-50 bottles/week</option>
                  <option value="50-100 bottles">50-100 bottles/week</option>
                  <option value="100-300 bottles">100-300 bottles/week</option>
                  <option value="300+ bottles">300+ bottles/week</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="ws-message"
                  className="block text-xs font-semibold text-gray-500 mb-1"
                >
                  Additional Notes{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  id="ws-message"
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  placeholder="Any special requirements, custom flavours, packaging needs..."
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none text-sm resize-none"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                className="flex items-center justify-center gap-2 w-full py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 active:scale-[0.98]"
              >
                <MessageCircle className="w-5 h-5" />
                Send Inquiry via WhatsApp
              </button>

              <p className="text-[11px] text-center text-gray-400">
                Your request will be sent via WhatsApp. We typically respond
                within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </main>
      <WhatsAppFloat />
      <Footer />
    </>
  );
}
