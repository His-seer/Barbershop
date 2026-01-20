"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Testimonials } from "@/components/sections/Testimonials";
import { BarbersShowcase } from "@/components/sections/BarbersShowcase";
import { FAQ } from "@/components/sections/FAQ";
import { LocationContact } from "@/components/sections/LocationContact";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { ArrowRight, Star, Scissors, Clock, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-richblack-900 text-gold-50 overflow-hidden relative">
      <Header />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center px-6">
        {/* Atmospheric Background Glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-gold-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-5xl w-full mx-auto grid md:grid-cols-2 gap-12 items-center mt-20">

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center space-x-2 text-gold-400 mb-6">
              <span className="w-12 h-[1px] bg-gold-500"></span>
              <span className="text-sm tracking-[0.3em] uppercase font-bold">Est. 2026 • Ghana</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.9] text-white mb-8">
              MASTER <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-600">CRAFTSMAN</span>
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-md mb-10 leading-relaxed">
              Precision cuts. Premium atmosphere. The ultimate grooming experience tailored for the modern gentleman locally and at home.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/book" className="group relative px-8 py-4 bg-gold-500 text-richblack-900 font-bold tracking-widest overflow-hidden rounded-lg shadow-elevated-gold hover:shadow-card-hover transition-all focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-richblack-900">
                <span className="relative z-10 flex items-center gap-2 justify-center">Book Appointment <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
                <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
              </Link>
              <Link href="#services" className="px-8 py-4 border border-white/20 hover:border-gold-500 hover:bg-gold-500/5 hover:text-gold-500 transition-all tracking-widest font-medium text-center rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-richblack-900">
                VIEW SERVICES
              </Link>
            </div>
          </motion.div>

          {/* Visual/Image Placeholder (Since we don't have images yet, using a stylized card) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden md:block relative"
          >
            <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-richblack-800 to-richblack-900 border border-white/10 overflow-hidden group rounded-2xl shadow-elevated premium-texture">
              {/* Abstract Stylized Shape simulating an image */}
              <div className="absolute inset-0 bg-gradient-to-br from-richblack-700/50 to-richblack-900" />

              {/* Decorative Circles */}
              <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-1/3 left-1/4 w-40 h-40 bg-gold-600/5 rounded-full blur-3xl" />

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="relative">
                  <div className="absolute inset-0 blur-2xl bg-gold-500/20 rounded-full"></div>
                  <Scissors className="relative w-24 h-24 text-gold-500/30 mx-auto mb-4" />
                </div>
                <p className="text-white/20 tracking-widest text-xs uppercase font-medium">Premium Service Experience</p>
              </div>

              {/* Floating Badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute bottom-8 -left-8 bg-richblack-900/90 backdrop-blur border border-gold-500/30 p-6 shadow-elevated-gold max-w-[200px] rounded-xl"
              >
                <div className="flex text-gold-500 mb-2">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-white font-bold text-lg mb-1">5.0 Rating</p>
                <p className="text-xs text-white/50">Based on 120+ reviews from local clients.</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Preview Grid */}
      <section id="services" className="py-24 px-6 bg-richblack-800 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl mb-4">Our Services</h2>
            <div className="w-24 h-1 bg-gold-500 mx-auto" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Standard Cut", price: "30 GHS", desc: "Precision cut, wash, and style.", icon: Scissors },
              { title: "The Royal Treatment", price: "80 GHS", desc: "Senior barber cut, hot towel, and massage.", icon: Star },
              { title: "Home Service", price: "500 GHS", desc: "We come to you. Full premium setup at your door.", icon: ShieldCheck, highlight: true }
            ].map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className={`p-8 border ${s.highlight ? 'border-gold-500 bg-gold-900/10 shadow-elevated-gold' : 'border-white/5 bg-white/5 shadow-card hover:shadow-card-hover'} hover:border-gold-500/50 transition-all transition-shadow-smooth group rounded-xl`}
              >
                <s.icon className={`w-10 h-10 mb-6 ${s.highlight ? 'text-gold-400' : 'text-white/50 group-hover:text-gold-400'}`} />
                <div className="flex justify-between items-baseline mb-4">
                  <h3 className="font-display text-2xl font-bold">{s.title}</h3>
                  <span className="text-gold-400 font-mono">{s.price}</span>
                </div>
                <p className="text-white/60 mb-6 text-sm leading-relaxed">{s.desc}</p>
                <Link href="/book" className="text-xs font-bold tracking-widest uppercase border-b border-transparent group-hover:border-gold-500 pb-1 transition-all">Book Now</Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Barbers Showcase */}
      <BarbersShowcase />

      {/* Testimonials */}
      <Testimonials />

      {/* FAQ */}
      <FAQ />

      {/* Location & Contact */}
      <LocationContact />

      {/* Footer */}
      <Footer />

      {/* WhatsApp Floating Button */}
      <WhatsAppButton />
    </main>
  );
}
