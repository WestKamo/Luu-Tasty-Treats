import Link from "next/link";
import { ArrowRight, ArrowUpRight, CakeSlice, MessageCircle, Github, Facebook } from "lucide-react";

export default function Home() {
  return (
    <div className="overflow-hidden bg-cream">
      <section className="relative isolate overflow-hidden border-b border-chocolate/10 px-6 pb-20 pt-16 sm:pt-24 lg:pb-28 lg:pt-28">
        <div className="pointer-events-none absolute -right-48 -top-44 h-[32rem] w-[32rem] rounded-full border border-chocolate/10 opacity-60" aria-hidden="true"/>
        <div className="pointer-events-none absolute -right-20 -top-24 h-[25rem] w-[25rem] rounded-full border border-chocolate/10 opacity-60" aria-hidden="true"/>
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative z-10">
            <p className="mb-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.27em] text-[#8e634c]"><span className="h-px w-10 bg-[#8e634c]"/> A small-batch cake atelier · Kokosi</p>
            <h1 className="max-w-3xl font-serif text-[clamp(3.7rem,9vw,8rem)] font-medium leading-[0.98] tracking-[-0.055em] text-chocolate">Beautifully<br/><span className="italic font-normal text-[#99715d]">personal.</span></h1>
            <p className="mt-8 max-w-lg text-base leading-8 text-chocolate/70 sm:text-lg">For all the candles, milestones, and little reasons to celebrate. Every cake is made to order, with a personal touch from the first layer to the last detail.</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/cakes" className="inline-flex items-center gap-3 rounded-full bg-chocolate px-6 py-3.5 text-sm font-semibold text-cream transition hover:bg-chocolate-light">Explore the Boutique <ArrowRight size={17}/></Link>
              <Link href="/owner" className="inline-flex items-center gap-2 rounded-full border border-chocolate/20 px-6 py-3.5 text-sm font-medium text-chocolate transition hover:bg-white">Meet the baker <ArrowUpRight size={16}/></Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md lg:ml-auto">
            <div className="overflow-hidden rounded-t-[12rem] rounded-b-[1.5rem] border-[9px] border-white bg-[#e7d4c4] shadow-[0_30px_80px_-35px_rgba(60,40,27,0.2)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/cake.png" alt="A handcrafted cake from Luu Tasty Treats" className="aspect-[4/5] w-full object-cover"/>
            </div>
            <div className="absolute -bottom-5 -left-4 rotate-[-7deg] rounded-md border border-[#b08b63]/35 bg-[#f8eedc] px-5 py-3 font-serif text-lg italic text-chocolate shadow-md sm:-left-8">Made just for you.</div>
          </div>
        </div>
      </section>
      <section className="bg-[#f3ece2] px-6 py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div className="flex items-start gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-chocolate/20"><CakeSlice size={21}/></div><p className="pt-3 text-xs font-semibold uppercase tracking-[0.25em] text-chocolate/65">Our philosophy</p></div>
          <div>
            <p className="font-serif text-3xl leading-snug tracking-tight text-chocolate sm:text-5xl">Not just cake.<br/><span className="italic text-[#9b705d]">A piece of your story.</span></p>
            <p className="mt-5 max-w-2xl leading-8 text-chocolate/65">Choose a design, make it yours, and tell us the small details that matter. Each creation is finished with intention by the baker behind Luu Tasty Treats.</p>
            <Link href="/owner" className="mt-7 inline-flex items-center gap-2 border-b border-chocolate pb-1 text-sm font-medium">Discover the maker <ArrowUpRight size={16}/></Link>
          </div>
        </div>
      </section>
      <section className="px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8e634c]">Here for your next celebration</p>
          <h2 className="mt-4 max-w-2xl font-serif text-4xl tracking-tight sm:text-6xl">Let’s make something <span className="italic text-[#9b705d]">worth sharing.</span></h2>
          <p className="mt-5 max-w-xl leading-8 text-chocolate/70">Have an idea for a custom cake or want to ask a question? Get in touch with the baker, or browse the collection to begin.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="https://wa.me/27631713034" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-chocolate px-5 py-3 text-sm font-semibold text-cream hover:bg-chocolate-light"><MessageCircle size={17}/> WhatsApp <ArrowUpRight size={14}/></a>
            <a href="https://www.facebook.com/search/top?q=Luu%20Tasty%20Treats" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-chocolate/20 px-5 py-3 text-sm hover:bg-white"><Facebook size={17}/> Find on Facebook <ArrowUpRight size={14}/></a>
            <a href="https://github.com/WestKamo" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-chocolate/20 px-5 py-3 text-sm hover:bg-white"><Github size={17}/> Site creator <ArrowUpRight size={14}/></a>
          </div>
          <p className="mt-3 text-xs text-chocolate/45">Facebook opens a search for the bakery until its official page link is confirmed.</p>
        </div>
      </section>
    </div>
  );
}
