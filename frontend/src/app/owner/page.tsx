"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Phone, MapPin, Sparkles } from "lucide-react";

export default function OwnerPage() {
  return (
    <div className="min-h-screen bg-cream text-black py-12 px-6">
      <div className="mx-auto max-w-4xl">
        
        {/* Back Link */}
        <Link 
          href="/cakes" 
          className="inline-flex items-center gap-2 text-sm font-medium text-black/70 transition hover:text-black mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> View Cakes Menu
        </Link>

        {/* Main Content Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl"
        >
          {/* Header Banner */}
          <div className="bg-black px-8 py-10 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            <Sparkles className="mx-auto h-8 w-8 mb-3 text-gray-300 animate-pulse" />
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-widest">
              Meet The Artisan
            </h1>
            <p className="text-gray-400 text-sm tracking-wider mt-1 uppercase">
              The Soul Behind Luu Tasty Treats
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-8 p-8 md:p-12 items-center">
            
            {/* Owner Image Column */}
            <div className="md:col-span-5 flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-black to-gray-600 opacity-30 blur group-hover:opacity-60 transition duration-500"></div>
                <div className="relative overflow-hidden rounded-2xl border-2 border-black bg-black shadow-lg w-64 h-80">
                  <Image 
                    src="/profile.png" 
                    alt="Lulama Nguxa - Owner of Luu Tasty Treats" 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Bio & Details Column */}
            <div className="md:col-span-7 space-y-6">
              <div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-black">
                  Lulama Nguxa
                </h2>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mt-1">
                  Founder & Master Baker
                </p>
              </div>

              {/* Motive & About */}
              <div className="space-y-3 text-sm text-gray-700 leading-relaxed font-sans">
                <p>
                  Welcome to my world of sweetness! I believe that every celebration, big or small, deserves a masterpiece crafted with absolute passion. Luu Tasty Treats was born from a deep-rooted love for baking custom creations that don&apos;t just look breathtaking—they melt hearts.
                </p>
                <p className="border-l-2 border-black pl-4 italic text-black/90 font-serif text-base">
                  &ldquo;My motive is simple: turning your sweetest imaginations into edible reality, one layer, flavor, and meticulous finish at a time.&rdquo;
                </p>
              </div>

              {/* Contact Information */}
              <div className="pt-4 border-t border-black/10 space-y-3">
                <h3 className="text-xs uppercase tracking-widest font-bold text-black">
                  Direct Connections
                </h3>
                
                <div className="grid gap-2 text-sm">
                  <a 
                    href="tel:+27631713034" 
                    className="flex items-center gap-3 text-gray-800 hover:text-black transition group"
                  >
                    <div className="p-2 rounded-full bg-black/5 group-hover:bg-black group-hover:text-white transition">
                      <Phone className="h-4 w-4" />
                    </div>
                    <span className="font-medium">+27 63 171 3034</span>
                  </a>

                  <a 
                    href="mailto:lulamanguxa@gmail.com" 
                    className="flex items-center gap-3 text-gray-800 hover:text-black transition group"
                  >
                    <div className="p-2 rounded-full bg-black/5 group-hover:bg-black group-hover:text-white transition">
                      <Mail className="h-4 w-4" />
                    </div>
                    <span className="font-medium">lulamanguxa@gmail.com</span>
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* Location & Interactive Map Section */}
          <div className="bg-gray-50 border-t border-black/10 p-8 md:p-12">
            <div className="grid md:grid-cols-12 gap-6 items-center">
              
              <div className="md:col-span-5 space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                  <MapPin className="h-4 w-4 text-black" /> Studio Location
                </div>
                <h3 className="font-serif text-xl font-bold text-black">
                  Kokosi, Fochville
                </h3>
                <p className="text-sm text-gray-600">
                  3214 Mbeki Street, Ext 3<br />
                  Kokosi, Fochville, 215<br />
                  South Africa
                </p>
              </div>

              {/* Map Embed pointing to Fochville / Kokosi area */}
              <div className="md:col-span-7">
                <div className="overflow-hidden rounded-xl border border-black/10 shadow-inner h-48 relative bg-gray-200">
                  <iframe
                    title="Kokosi Fochville Location Map"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
		    src="https://maps.google.com/maps?q=3214+Mbeki+Street,+Kokosi,+Fochville&t=&z=15&ie=UTF8&iwloc=&output=embed"
                    allowFullScreen={false}
                  />
                </div>
              </div>

            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
