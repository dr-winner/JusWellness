"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { logReview } from "@/lib/sheets";
import { products } from "@/lib/products";
import {
  Star,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquareQuote,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  SEED REVIEWS — shown alongside user-submitted ones                */
/* ------------------------------------------------------------------ */
interface Review {
  id: string;
  customerName: string;
  product: string;
  rating: number;
  text: string;
  date: string;
  verified?: boolean;
}

const seedReviews: Review[] = [
  {
    id: "seed-1",
    customerName: "Ama K.",
    product: "Better Off Red",
    rating: 5,
    text: "Jus has completely changed my morning routine. The Better Off Red is INSANE — I feel energized all day. Nothing else in Accra comes close to this level of freshness.",
    date: "2026-05-28",
    verified: true,
  },
  {
    id: "seed-2",
    customerName: "Kofi M.",
    product: "Take Me Higher",
    rating: 5,
    text: "I was skeptical about juice delivery, but the freshness is real. You can taste the difference. My whole office orders every week now. The Take Me Higher is addictive.",
    date: "2026-05-22",
    verified: true,
  },
  {
    id: "seed-3",
    customerName: "Abena D.",
    product: "Ginger Shot",
    rating: 5,
    text: "The Ginger Shots got me through the rainy season without catching anything. Plus the delivery is always on time. The WhatsApp ordering makes it so easy!",
    date: "2026-05-15",
    verified: true,
  },
  {
    id: "seed-4",
    customerName: "Yaw B.",
    product: "Lover's Rock",
    rating: 5,
    text: "The Lover's Rock is my weekly treat. Creamy, filling, and actually good for you. I've replaced my afternoon coffee with Ginga Yourself — never going back.",
    date: "2026-05-10",
    verified: true,
  },
  {
    id: "seed-5",
    customerName: "Efua A.",
    product: "Ginga Yourself",
    rating: 4,
    text: "Love the ginger kick! It's strong but balanced. I order the monthly subscription and it's so convenient. Only wish the 750ml was a bit cheaper.",
    date: "2026-05-05",
    verified: true,
  },
  {
    id: "seed-6",
    customerName: "Kwame S.",
    product: "Coco Loco",
    rating: 5,
    text: "Pure coconut water that actually tastes like fresh coconut — not the watered down stuff you get at the supermarket. Incredible after gym sessions.",
    date: "2026-04-28",
    verified: true,
  },
];

const LOCAL_STORAGE_KEY = "jus-reviews";

function getLocalReviews(): Review[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalReview(review: Review) {
  const existing = getLocalReviews();
  existing.unshift(review);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
}

/* ------------------------------------------------------------------ */
/*  STAR RATING COMPONENT                                             */
/* ------------------------------------------------------------------ */
function StarRating({
  rating,
  onRate,
  interactive = false,
  size = "w-5 h-5",
}: {
  rating: number;
  onRate?: (r: number) => void;
  interactive?: boolean;
  size?: string;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          <Star
            className={`${size} transition-colors ${
              star <= (hover || rating)
                ? "fill-brand-gold text-brand-gold"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN REVIEWS PAGE                                                 */
/* ------------------------------------------------------------------ */
export default function ReviewsPage() {
  const [localReviews, setLocalReviews] = useState<Review[]>(() =>
    getLocalReviews()
  );
  const allReviews = [...localReviews, ...seedReviews];

  // Form state
  const [name, setName] = useState("");
  const [product, setProduct] = useState("");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const avgRating =
    allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Please enter your name";
    if (!product) e.product = "Select a product";
    if (rating === 0) e.rating = "Tap a star to rate";
    if (!text.trim()) e.text = "Write a short review";
    else if (text.trim().length < 10)
      e.text = "Please write at least 10 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const review: Review = {
      id: `user-${Date.now()}`,
      customerName: name.trim(),
      product,
      rating,
      text: text.trim(),
      date: new Date().toISOString().split("T")[0],
    };

    saveLocalReview(review);
    setLocalReviews((prev) => [review, ...prev]);
    setShowSuccess(true);

    // Fire-and-forget: log to Google Sheet
    logReview({
      customerName: review.customerName,
      product: review.product,
      rating: review.rating,
      text: review.text,
    });

    // Reset form
    setName("");
    setProduct("");
    setRating(0);
    setText("");
    setErrors({});

    setTimeout(() => setShowSuccess(false), 4000);
  };

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
                Customer Reviews
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-brand-green-dark">
              Loved by Accra
            </h1>
            <p className="text-gray-500 max-w-lg mx-auto">
              Real reviews from real people. See why {allReviews.length}+ juice
              lovers trust Jus for their daily wellness.
            </p>
            {/* Stats bar */}
            <div className="flex items-center justify-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <StarRating rating={Math.round(avgRating)} size="w-4 h-4" />
                <span className="text-sm font-bold text-gray-900">
                  {avgRating.toFixed(1)}
                </span>
              </div>
              <div className="w-px h-5 bg-gray-200" />
              <span className="text-sm text-gray-500">
                {allReviews.length} reviews
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr,380px] gap-8 items-start">
            {/* Reviews list */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {allReviews.map((review) => (
                  <motion.div
                    key={review.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white rounded-2xl border border-gray-100 p-6"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-gold/30 to-brand-green/30 flex items-center justify-center text-xs font-bold text-brand-green-dark">
                          {review.customerName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                            {review.customerName}
                            {review.verified && (
                              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                                Verified
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400">{review.date}</p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} size="w-3.5 h-3.5" />
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      &ldquo;{review.text}&rdquo;
                    </p>

                    <span className="inline-block px-3 py-1 bg-brand-cream text-brand-green-dark text-xs font-medium rounded-full">
                      {review.product}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Submit review form — sticky sidebar */}
            <div className="lg:sticky lg:top-28">
              <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center">
                    <MessageSquareQuote className="w-5 h-5 text-brand-green" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Write a Review</h3>
                    <p className="text-xs text-gray-500">
                      Share your Jus experience
                    </p>
                  </div>
                </div>

                {/* Success flash */}
                <AnimatePresence>
                  {showSuccess && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 p-3 bg-green-50 text-green-700 text-sm font-medium rounded-xl"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      Thanks for your review! 🎉
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Name */}
                <div>
                  <label
                    htmlFor="rev-name"
                    className="block text-xs font-semibold text-gray-500 mb-1"
                  >
                    Your Name *
                  </label>
                  <input
                    id="rev-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((p) => ({ ...p, name: "" }));
                    }}
                    placeholder="Ama Mensah"
                    maxLength={50}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.name ? "border-red-400" : "border-gray-200"} focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none text-sm`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Product */}
                <div>
                  <label
                    htmlFor="rev-product"
                    className="block text-xs font-semibold text-gray-500 mb-1"
                  >
                    Product *
                  </label>
                  <select
                    id="rev-product"
                    value={product}
                    onChange={(e) => {
                      setProduct(e.target.value);
                      if (errors.product)
                        setErrors((p) => ({ ...p, product: "" }));
                    }}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.product ? "border-red-400" : "border-gray-200"} focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none text-sm bg-white`}
                  >
                    <option value="">Select a product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {errors.product && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.product}
                    </p>
                  )}
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">
                    Rating *
                  </label>
                  <StarRating
                    rating={rating}
                    onRate={(r) => {
                      setRating(r);
                      if (errors.rating)
                        setErrors((p) => ({ ...p, rating: "" }));
                    }}
                    interactive
                    size="w-7 h-7"
                  />
                  {errors.rating && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.rating}
                    </p>
                  )}
                </div>

                {/* Review text */}
                <div>
                  <label
                    htmlFor="rev-text"
                    className="block text-xs font-semibold text-gray-500 mb-1"
                  >
                    Your Review *
                  </label>
                  <textarea
                    id="rev-text"
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      if (errors.text) setErrors((p) => ({ ...p, text: "" }));
                    }}
                    placeholder="What did you love about this juice?"
                    maxLength={500}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.text ? "border-red-400" : "border-gray-200"} focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none text-sm resize-none`}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.text ? (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.text}
                      </p>
                    ) : (
                      <span />
                    )}
                    <span className="text-[10px] text-gray-400">
                      {text.length}/500
                    </span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-brand-green text-white font-bold rounded-xl hover:bg-brand-green-dark transition-all active:scale-[0.98]"
                >
                  <Send className="w-4 h-4" />
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <WhatsAppFloat />
      <Footer />
    </>
  );
}
