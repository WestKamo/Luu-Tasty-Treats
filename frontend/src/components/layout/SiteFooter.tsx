import Link from "next/link";
import { ArrowUpRight, Heart, MessageCircle, Mail } from "lucide-react";
import { FacebookIcon } from "@/components/icons/FacebookIcon";
import { bakeryContacts } from "@/lib/bakeryContacts";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-chocolate/10 bg-[#f3ece2] text-chocolate">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-11 sm:grid-cols-2 lg:grid-cols-3 lg:gap-14 lg:py-14">
        <div>
          <p className="font-serif text-2xl tracking-tight">Luu Tasty Treats<span className="text-[#a36a51]">.</span></p>
          <p className="mt-3 max-w-xs text-sm leading-7 text-chocolate/65">Thoughtfully baked, personally finished, and made for the moments worth remembering.</p>
        </div>
        <div className="flex flex-col items-start gap-3 text-sm">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-chocolate/50">The boutique</p>
          <Link href="/cakes" className="hover:underline">The collection</Link>
          <Link href="/owner" className="hover:underline">Meet the baker</Link>
          <Link href="/policies" className="hover:underline">Our policies</Link>
        </div>
        <div>
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-chocolate/50">A little conversation?</p>
          <div className="flex flex-col gap-2.5">
            <a href={bakeryContacts.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-chocolate px-4 py-2.5 text-sm font-medium text-cream transition hover:bg-chocolate-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate"><MessageCircle size={17} aria-hidden="true"/> WhatsApp <span className="font-normal text-cream/80">{bakeryContacts.phoneDisplay}</span></a>
            <a href={bakeryContacts.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-chocolate/20 px-4 py-2.5 text-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate"><FacebookIcon className="h-4.5 w-4.5" /> Visit Facebook <ArrowUpRight size={14} aria-hidden="true"/></a>
            <a href={bakeryContacts.emailHref} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-chocolate/20 px-4 py-2.5 text-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate"><Mail size={17} aria-hidden="true"/> Email the baker</a>
          </div>
          <p className="mt-3 text-xs text-chocolate/50">Kokosi, Fochville · Made to order</p>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-chocolate/10 px-6 py-5 text-xs text-chocolate/55 sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} Luu Tasty Treats. Handmade with care.</span>
        <span className="inline-flex items-center gap-1">Lovingly crafted on the web by <a className="font-medium text-chocolate underline decoration-chocolate/25 underline-offset-4" href={bakeryContacts.developer} target="_blank" rel="noopener noreferrer">Phindile Sandi</a><Heart size={12} className="ml-1 text-[#a36a51]" aria-hidden="true"/></span>
      </div>
    </footer>
  );
}
