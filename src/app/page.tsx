import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import WhyJus from "@/components/WhyJus";
import About from "@/components/About";
import Testimonials from "@/components/Testimonials";
import CTABanner from "@/components/CTABanner";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <FeaturedProducts />
      <WhyJus />
      <About />
      <Testimonials />
      <CTABanner />
      <Contact />
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
