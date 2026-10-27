import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Mail, MapPin, MessageCircle } from "lucide-react";
import { FacebookIcon } from "@/components/icons/FacebookIcon";
import { bakeryContacts } from "@/lib/bakeryContacts";

export default function OwnerPage() {
  return (
    <div className="min-h-screen bg-cream text-chocolate">
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-12 sm:pt-20">
        <Link href="/cakes" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-chocolate/65 transition hover:text-chocolate"><ArrowLeft size={16}/> Back to the boutique</Link>
        <div className="mt-12 grid items-center gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:gap-24">
          <div className="relative mx-auto w-full max-w-[28rem]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-[11rem] rounded-b-[1rem] border-8 border-white bg-[#e7d9cb] shadow-[0_26px_80px_-30px_rgba(56,41,35,.23)]">
              <Image src="/profile.png" alt="Lulama Nguxa, the baker behind Luu Tasty Treats" fill sizes="(max-width: 1024px) 100vw, 448px" className="object-cover" priority/>
            </div>
            <span className="absolute -bottom-4 -right-3 rotate-3 rounded-md border border-[#be9c7a]/30 bg-[#f8eedd] px-5 py-3 font-serif italic shadow-md">A little flour. A lot of love.</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#996d57]">The hands behind the sweetness</p>
            <h1 className="mt-5 font-serif text-[clamp(3.5rem,7vw,6rem)] leading-[1.02] tracking-[-0.05em]">Meet <span className="italic text-[#a07660]">Lulama.</span></h1>
            <p className="mt-4 text-sm font-medium uppercase tracking-[0.16em] text-chocolate/55">Lulama Nguxa · Founder & baker</p>
            <div className="mt-9 max-w-xl space-y-5 text-[15px] leading-8 text-chocolate/70">
              <p>Behind every Luu Tasty Treats creation is a real person, a little patience, and a great deal of heart. I believe every celebration deserves a cake made with care, not pulled from a production line.</p>
              <p>Whether you have a design in mind or just a feeling you want to capture, we’ll work together on the details that make your celebration yours.</p>
            </div>
            <blockquote className="mt-9 border-l-2 border-[#b18168] pl-6 font-serif text-2xl italic leading-relaxed text-chocolate">“One layer, one detail, one lovely moment at a time.”</blockquote>
            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Contact Lulama">
              <a href={bakeryContacts.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-chocolate px-5 py-3 text-sm font-semibold text-cream transition hover:bg-chocolate-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate"><MessageCircle size={17} aria-hidden="true"/> WhatsApp <span className="font-normal text-cream/80">{bakeryContacts.phoneDisplay}</span></a>
              <a href={bakeryContacts.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-chocolate/20 px-5 py-3 text-sm font-medium transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate"><FacebookIcon className="h-5 w-5" /> Facebook <ArrowUpRight size={15} aria-hidden="true"/></a>
              <a href={bakeryContacts.emailHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-chocolate/20 px-5 py-3 text-sm font-medium transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate sm:col-span-2"><Mail size={17} aria-hidden="true"/> {bakeryContacts.email}</a>
            </div>
          </div>
        </div>
      </div>
      <section className="border-t border-chocolate/10 bg-[#f3ece2] px-6 py-12 sm:py-16">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-chocolate/60"><MapPin size={15}/> Our neighbourhood</p>
            <h2 className="mt-3 font-serif text-3xl">Baked in Kokosi, Fochville.</h2>
            <p className="mt-2 max-w-lg text-sm leading-7 text-chocolate/60">Made with care in our local kitchen. Collection arrangements are confirmed with the baker.</p>
          </div>
          <Link href="/cakes" className="inline-flex items-center gap-2 rounded-full border border-chocolate/25 px-6 py-3 text-sm font-semibold hover:bg-white">Find your cake <ArrowUpRight size={16}/></Link>
        </div>
      </section>
    </div>
  );
}
