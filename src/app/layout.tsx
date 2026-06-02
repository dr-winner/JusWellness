import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://juswellness.com"),
  title: {
    default: "Jus Wellness | Fresh Cold-Pressed Juices in Accra, Ghana",
    template: "%s | Jus Wellness",
  },
  description:
    "100% fresh, no additives cold-pressed juices delivered to your door in Accra. Made daily with love. 22 flavours, same-day delivery. Order via WhatsApp.",
  keywords: [
    "cold pressed juice",
    "fresh juice Accra",
    "juice delivery Ghana",
    "wellness juice",
    "healthy drinks Ghana",
    "East Legon juice",
    "coconut water Accra",
    "ginger shot Ghana",
    "juice order WhatsApp",
    "Jus Wellness",
  ],
  authors: [{ name: "Jus Wellness" }],
  creator: "Jus Wellness",
  openGraph: {
    title: "Jus Wellness | Fresh Juice, Daily",
    description:
      "No additives. No shortcuts. Just pure, fresh juice made daily in Accra. 22 flavours, same-day delivery across Accra.",
    url: "https://juswellness.com",
    siteName: "Jus Wellness",
    locale: "en_GH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jus Wellness | Fresh Juice, Daily",
    description:
      "No additives. No shortcuts. Just pure, fresh juice made daily in Accra.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add Google Search Console verification when available
    // google: "your-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Structured data for local business SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Jus Wellness",
              description:
                "Fresh cold-pressed juices made daily in East Legon, Accra. No additives, no preservatives.",
              url: "https://juswellness.com",
              telephone: "+233551792710",
              address: {
                "@type": "PostalAddress",
                addressLocality: "East Legon",
                addressRegion: "Greater Accra",
                addressCountry: "GH",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: "5.6370",
                longitude: "-0.1578",
              },
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ],
                opens: "06:00",
                closes: "20:00",
              },
              priceRange: "GHS 15-280",
              image: "https://juswellness.com/opengraph-image",
              sameAs: ["https://instagram.com/jus_wellness"],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
