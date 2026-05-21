"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/233551792710?text=Hi!%20I'd%20like%20to%20order%20some%20juice%20🧃"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-40 group"
      aria-label="Chat on WhatsApp"
    >
      <div className="relative">
        {/* Pulse ring */}
        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" />
        {/* Button */}
        <div className="relative w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30 hover:bg-green-600 hover:scale-110 transition-all duration-300">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
      </div>
      {/* Tooltip */}
      <div className="absolute left-16 bottom-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Chat with us
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
      </div>
    </a>
  );
}
