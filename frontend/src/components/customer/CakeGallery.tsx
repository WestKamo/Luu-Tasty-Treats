"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import CakePhoto from "@/components/customer/CakePhoto";

export function CakeGallery({ images, name }: { images: (string | null | undefined)[]; name: string }) {
  const photos = useMemo(() => [...new Set(images.filter((item): item is string => Boolean(item?.trim())))], [images]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const current = photos.length ? active % photos.length : 0;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (photos.length < 2 || paused || reducedMotion) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") setActive((i) => (i + 1) % photos.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, [photos.length, paused, reducedMotion]);

  const move = (step: number) => setActive((i) => (i + step + photos.length) % photos.length);

  return (
    <section aria-label={`Design photos for ${name}`} className="group">
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] border border-chocolate/10 bg-vanilla/40 shadow-sm sm:aspect-[5/4] sm:rounded-[2rem]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <CakePhoto key={photos[current] || "missing"} src={photos[current]} alt={`${name} — design photograph ${current + 1}`} className="h-full w-full" eager />
        {photos.length > 1 && (
          <>
            <div className="absolute bottom-4 left-4 rounded-full bg-cream/95 px-3 py-1 text-xs font-medium text-chocolate shadow-sm" aria-live="polite">{current + 1} / {photos.length}</div>
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <button type="button" onClick={() => move(-1)} aria-label="Previous cake photograph" className="grid h-10 w-10 place-items-center rounded-full bg-cream/95 text-chocolate shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate"><ChevronLeft size={19}/></button>
              <button type="button" onClick={() => move(1)} aria-label="Next cake photograph" className="grid h-10 w-10 place-items-center rounded-full bg-cream/95 text-chocolate shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate"><ChevronRight size={19}/></button>
              {!reducedMotion && <button type="button" onClick={() => setPaused((v) => !v)} aria-label={paused ? "Resume slideshow" : "Pause slideshow"} className="grid h-10 w-10 place-items-center rounded-full bg-cream/95 text-chocolate shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate">{paused ? <Play size={16}/> : <Pause size={16}/>}</button>}
            </div>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2" aria-label="Choose design photograph">
          {photos.map((src, index) => (
            <button type="button" key={src} onClick={() => setActive(index)} aria-label={`View photograph ${index + 1}`} aria-pressed={index === current}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-opacity sm:h-20 sm:w-20 ${index === current ? "border-chocolate opacity-100" : "border-transparent opacity-65 hover:opacity-100"}`}>
              <CakePhoto src={src} alt={`${name} thumbnail ${index + 1}`} className="h-full w-full"/>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
