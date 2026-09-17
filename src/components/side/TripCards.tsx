import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowUpRight, BookOpen, MapPin, Plane } from 'lucide-react';
import { latestTrip, profile } from '@/data/resume';
import WidgetCard from './WidgetCard';

/** The latest trip, shown as its magazine cover; opens the magazine page. */
export function LatestTripCard() {
  const t = latestTrip;
  return (
    <WidgetCard icon={<Plane className="size-3.5 text-sky-600" />} label="Latest trip">
      <Link to={`/trips/${t.slug}`} className="group block" aria-label={`Read the ${t.place} magazine`}>
        <motion.div
          whileHover={{ rotate: -1.5, y: -2 }}
          className="relative overflow-hidden rounded-sm shadow-[0_10px_24px_-10px_rgba(0,0,0,0.45)] ring-1 ring-black/10"
        >
          {/* The cover page already carries the masthead and title. */}
          <img src={t.cover} alt={`${t.place} magazine cover`} loading="lazy" className="block w-full" />
        </motion.div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="min-w-0 leading-tight">
            <span className="flex items-center gap-1 text-sm font-semibold">
              <MapPin className="size-3.5 shrink-0 text-rose-500" />
              {t.place}
            </span>
            <span className="text-[10px] text-muted-foreground">{t.region} · {t.when}</span>
          </p>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background transition-transform group-hover:translate-x-0.5">
            <BookOpen className="size-3" /> Read
          </span>
        </div>
      </Link>
    </WidgetCard>
  );
}

/** Small ad for Atlas, the app the magazine was made with. */
export function AtlasAd() {
  return (
    <section aria-label="Atlas">
      <a
        href={profile.website.href}
        target="_blank"
        rel="noreferrer"
        className="group relative block overflow-hidden rounded-2xl bg-zinc-950 p-3.5 text-white shadow-[0_10px_28px_-12px_rgba(0,0,0,0.5)]"
      >
        <span className="absolute top-2.5 right-3 font-mono text-[8px] tracking-widest text-white/50 uppercase">Sponsored by me</span>
        <img src="/atlas-mark.svg" alt="" className="size-8 rounded-lg ring-1 ring-white/15" />
        <p className="mt-2.5 font-serif text-[22px] leading-[1.05]">
          The trip is over.
          <br />
          <span className="italic text-orange-300">The story isn’t.</span>
        </p>
        <p className="mt-2 text-[11px] leading-snug text-white/70">
          Turn ten trip photos and your own words into a magazine like this one. Free to start; photos never leave your device.
        </p>
        <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-zinc-950 transition-transform group-hover:translate-x-0.5">
          Make yours on Atlas <ArrowUpRight className="size-3.5" />
        </span>
      </a>
    </section>
  );
}
