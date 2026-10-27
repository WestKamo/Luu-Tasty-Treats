import Link from "next/link";
import { ArrowUpRight, Facebook, Github, MessageCircle, Heart } from "lucide-react";
import { contactLinks } from "@/lib/contact";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-chocolate/10 bg-[#F4EEE6] text-chocolate">
      <div className="mx-auto grid max-w-7xl gap-9 px-5 py-12 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr] lg:py-16">
        <div>
          <Link href="/" className="font-serif text-2xl font-semibold tracking-tight">Luu Tasty Treats</Link>
          <p className="mt-3 max-w-xs text-sm leading-7 text-chocolate/65">A small-batch cake atelier. Thoughtful details, made for your unforgettable moments.</p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-chocolate/50">Discover</p>
          <Link href="/cakes" className="block w-fit hover:text-berry-dark">The cake boutique</Link>
          <Link href="/owner" className="block w-fit hover:text-berry-dark">Meet the baker</Link>
          <Link href="/policies" className="block w-fit hover:text-berry-dark">Our policies</Link>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-chocolate/50">Stay in touch</p>
          <a href={contactLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="flex w-fit items-center gap-2 hover:text-berry-dark"><MessageCircle className="h-4 w-4" /> WhatsApp <ArrowUpRight className="h-3.5 w-3.5" /></a>
          <a href={contactLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex w-fit items-center gap-2 hover:text-berry-dark"><Facebook className="h-4 w-4" /> Find us on Facebook <ArrowUpRight className="h-3.5 w-3.5" /></a>
          <a href={contactLinks.github} target="_blank" rel="noopener noreferrer" className="flex w-fit items-center gap-2 hover:text-berry-dark"><Github className="h-4 w-4" /> Built with care <ArrowUpRight className="h-3.5 w-3.5" /></a>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-chocolate/10 px-5 py-5 text-xs text-chocolate/55 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>© {new Date().getFullYear()} Luu Tasty Treats. Baked with intention.</p>
        <p className="inline-flex items-center gap-1.5">Digital craftsmanship by <span className="font-semibold text-chocolate/75">Phindile Sandi</span><Heart className="h-3 w-3 text-berry-dark" aria-hidden="true" /></p>
      </div>
    </footer>
  );
}
