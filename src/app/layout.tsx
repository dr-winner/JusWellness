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
  title: "Jus Wellness | Fresh Cold-Pressed Juices in Accra, Ghana",
  description:
    "100% fresh, no additives cold-pressed juices delivered to your door in Accra. Made daily with love. Retail, wholesale & event orders available.",
  keywords: [
    "cold pressed juice",
    "fresh juice Accra",
    "juice delivery Ghana",
    "wellness juice",
    "healthy drinks Ghana",
    "East Legon juice",
  ],
  openGraph: {
    title: "Jus Wellness | Fresh Juice, Daily",
    description:
      "No additives. No shortcuts. Just pure, fresh juice made daily in Accra.",
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
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
