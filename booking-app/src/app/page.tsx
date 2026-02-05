"use client";
import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Testimonials } from "@/components/sections/Testimonials";
import { BarbersShowcase } from "@/components/sections/BarbersShowcase";
import { FAQ } from "@/components/sections/FAQ";
import { LocationContact } from "@/components/sections/LocationContact";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { ArrowRight, Star, Scissors, ShieldCheck, Loader2 } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { getServices, getShopSettings, getStaff, getHeroSlides, getApprovedReviews } from "@/utils/supabase/queries";
import { useBookingStore } from "@/store/booking";
import type { Service, ShopSettings, Staff, HeroSlide, Review } from "@/types/database";

// Extracted Hero Section to isolate useScroll
function HeroSection({ settings, slides }: { settings: ShopSettings | null; slides: HeroSlide[] }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const yText = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const yImage = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-cycle through slides
  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  // Get current image URL
  const currentImageUrl = slides.length > 0
    ? slides[currentSlide]?.image_url
    : settings?.banner_url || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop";

  return (
    <section ref={containerRef} className="relative h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* Animated Gradient Orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />

      <div className="relative z-10 max-w-6xl w-full mx-auto grid md:grid-cols-2 gap-12 items-center mt-20">

        {/* Text Content with Parallax */}
        <motion.div style={{ y: yText, opacity: opacityHero }}>
          <div className="flex items-center space-x-2 text-gold-400 mb-6">
            <span className="w-12 h-[1px] bg-gold-500"></span>
            <span className="text-sm tracking-[0.3em] uppercase font-bold">Est. 2026 • {settings?.shop_address?.split(',').pop()?.trim() || 'Ghana'}</span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl lg:text-8xl font-bold leading-[0.85] text-white mb-8 tracking-tighter">
            {settings?.shop_name?.split(' ')[0] || 'MASTER'} <br />
            <span className="text-mask-gold">{settings?.shop_name?.split(' ').slice(1).join(' ') || 'CRAFTSMAN'}</span>
          </h1>

          <p className="text-white/60 text-lg md:text-xl max-w-md mb-10 leading-relaxed font-light">
            Precision cuts. Premium atmosphere. The ultimate grooming experience tailored for the modern gentleman.
          </p>

          <div className="flex flex-col sm:flex-row gap-6">
            <MagneticButton>
              <Link href="/book" className="flex items-center justify-center gap-2 px-8 py-4 bg-gold-500 text-richblack-900 font-bold tracking-widest rounded-lg hover:bg-white transition-colors">
                BOOK APPOINTMENT <ArrowRight className="w-4 h-4" />
              </Link>
            </MagneticButton>

            <MagneticButton>
              <Link href="#services" className="flex items-center justify-center px-8 py-4 border border-white/20 hover:border-gold-500 text-white hover:text-gold-500 transition-colors tracking-widest font-medium rounded-lg">
                VIEW SERVICES
              </Link>
            </MagneticButton>
          </div>
        </motion.div>

        {/* Visual with Parallax Reverse - Carousel */}
        <motion.div
          style={{ y: yImage, opacity: opacityHero }}
          className="hidden md:block relative perspective-1000"
        >
          {/* Background Image - Dynamic Carousel */}
          <div className="relative w-full aspect-square max-h-[600px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
            <div className="absolute inset-0 z-0">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentSlide}
                  src={currentImageUrl}
                  alt="Barbershop Atmosphere"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.9 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="w-full h-full object-cover scale-105 animate-slow-zoom"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-richblack-900/50 via-transparent to-transparent" />
            </div>

            {/* Slide Indicators */}
            {slides.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-gold-500 w-4' : 'bg-white/30 hover:bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Floating Rating Card */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute bottom-12 -left-12 z-20 bg-richblack-900/90 backdrop-blur-md border border-gold-500/30 p-6 rounded-xl shadow-elevated-gold"
          >
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 text-gold-500 fill-gold-500" />)}
            </div>
            <p className="text-white font-bold text-xl">5.0 Rating</p>
            <p className="text-white/40 text-xs mt-1">120+ Verified Reviews</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  // Data State
  const [services, setServices] = useState<Service[]>([]);
  const [shopSettings, setShopSettings] = useState<ShopSettings | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { reset } = useBookingStore();

  useEffect(() => {
    // Reset booking state when user lands on home page
    reset();

    async function fetchData() {
      try {
        const [servicesData, settingsData, staffData, slidesData, reviewsData] = await Promise.all([
          getServices(),
          getShopSettings(),
          getStaff(),
          getHeroSlides(),
          getApprovedReviews(3)
        ]);
        setServices(servicesData);
        setShopSettings(settingsData);
        setStaff(staffData);
        setHeroSlides(slidesData);
        setReviews(reviewsData);
      } catch (error) {
        console.error("Failed to fetch landing page data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [reset]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-richblack-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-richblack-900 text-gold-50 overflow-hidden relative">
      {/* 1. Global Noise Overlay */}
      <div className="bg-noise" />

      <Header />

      <HeroSection settings={shopSettings} slides={heroSlides} />

      {/* Services Preview Grid with Scroll Animation */}
      <ServicesSection services={services} />

      {/* Sections passed with props where needed */}
      <BarbersShowcase staff={staff} />
      <Testimonials reviews={reviews} />
      <FAQ />
      <LocationContact settings={shopSettings} />
      <Footer settings={shopSettings} />
      <WhatsAppButton phone={shopSettings?.shop_phone} />
    </main>
  );
}

// Extracted for cleaner code
function ServicesSection({ services }: { services: Service[] }) {
  return (
    <section id="services" className="py-32 px-6 bg-richblack-800 relative z-10">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="font-display text-4xl md:text-5xl mb-4 text-white">Our Services</h2>
          <div className="w-24 h-1 bg-gold-500 mx-auto" />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.length > 0 ? (
            services.slice(0, 3).map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`p-10 border rounded-2xl transition-all duration-500 group cursor-pointer border-white/10 bg-white/5 hover:border-gold-500/50 hover:bg-gold-500/5`}
              >
                <Scissors className="w-12 h-12 mb-8 text-gold-500/50 group-hover:text-gold-400 transition-colors duration-500" />
                <div className="flex justify-between items-baseline mb-4">
                  <h3 className="font-display text-2xl font-bold text-white group-hover:text-gold-500 transition-colors">{s.name}</h3>
                  <span className="text-gold-400 font-mono text-lg">{s.price} GHS</span>
                </div>
                <p className="text-white/50 mb-8 leading-relaxed group-hover:text-white/80 transition-colors">{s.description}</p>
                <Link href="/book" className="text-xs font-bold tracking-[0.2em] uppercase transition-colors text-white/40 group-hover:text-gold-500">
                  Book Now
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 text-center text-white/40">
              No services available at the moment.
            </div>
          )}
        </div>

        <div className="mt-16 text-center">
          <Link href="/book" className="inline-flex items-center gap-2 text-gold-500 hover:text-white transition-colors font-bold tracking-widest border-b border-gold-500/30 pb-1 hover:border-white">
            VIEW FULL MENU <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
