import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Star } from 'lucide-react';
import { SiImdb } from 'react-icons/si';
import { VscVscode } from 'react-icons/vsc';
import WidgetCard from './WidgetCard';

// Mirrors the types in server/activity.ts (kept separate so no server code is bundled).
interface Book {
  title: string;
  author: string;
  cover: string | null;
  url: string;
}
interface Film {
  title: string;
  year: string | null;
  poster: string | null;
  url: string;
  myRating: number | null;
  imdbRating: number | null;
  watchedOn: string | null;
}
interface Coding {
  totalText: string;
  dailyAverageText: string;
  languages: { name: string; percent: number }[];
  editor: string | null;
}
interface Activity {
  reading: Book | null;
  watched: Film | null;
  coding: Coding | null;
}

const LANGUAGE_COLORS: Record<string, string> = {
  Java: '#B07219',
  TypeScript: '#3178C6',
  JavaScript: '#E5C100',
  TSX: '#3178C6',
  SQL: '#E38C00',
  Python: '#3572A5',
  Kotlin: '#A97BFF',
  Go: '#00ADD8',
  YAML: '#CB171E',
  JSON: '#6B7280',
  Markdown: '#083FA1',
  HTML: '#E34C26',
  CSS: '#563D7C',
  Bash: '#89E051',
  Dockerfile: '#384D54',
  HCL: '#844FBA',
};
const FALLBACK_COLORS = ['#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export function useActivity() {
  const [activity, setActivity] = useState<Activity | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch('/api/activity')
      .then((res) => (res.ok ? (res.json() as Promise<Activity>) : null))
      .then((data) => {
        if (!cancelled) setActivity(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return activity;
}

const appear = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: 'easeOut' },
} as const;

function Cover({ src, alt }: { src: string | null; alt: string }) {
  return (
    <div className="h-[60px] w-10 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-black/5">
      {src && <img src={src} alt={alt} loading="lazy" className="size-full object-cover" />}
    </div>
  );
}

function MyRating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5 font-medium text-foreground" aria-label={`My rating ${value} out of 10`}>
      <Star className="size-3 fill-sky-500 text-sky-500" />
      {value}
      <span className="text-muted-foreground">/10</span>
    </span>
  );
}

function ImdbRating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-1" aria-label={`IMDb rating ${value} out of 10`}>
      <span className="rounded-[3px] bg-[#F5C518] px-1 text-[9px] leading-[14px] font-extrabold text-black">IMDb</span>
      <span className="font-medium text-foreground">{value.toFixed(1)}</span>
    </span>
  );
}

export function ReadingCard({ book }: { book: Book }) {
  return (
    <motion.div {...appear}>
      <WidgetCard icon={<BookOpen className="size-3.5 text-emerald-600" />} label="Currently reading">
        <a href={book.url} target="_blank" rel="noreferrer" className="group flex gap-3">
          <Cover src={book.cover} alt={`${book.title} cover`} />
          <div className="min-w-0 self-center">
            <p className="line-clamp-2 text-sm leading-snug font-semibold group-hover:underline">{book.title}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{book.author}</p>
          </div>
        </a>
      </WidgetCard>
    </motion.div>
  );
}

export function WatchedCard({ film }: { film: Film }) {
  const watched = film.watchedOn
    ? new Date(`${film.watchedOn}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;
  return (
    <motion.div {...appear}>
      <WidgetCard icon={<SiImdb className="size-3.5 text-[#E2B616]" />} label="Last watched">
        <a href={film.url} target="_blank" rel="noreferrer" className="group flex gap-3">
          <Cover src={film.poster} alt={`${film.title} poster`} />
          <div className="min-w-0 self-center">
            <p className="line-clamp-2 text-sm leading-snug font-semibold group-hover:underline">
              {film.title}
              {film.year && <span className="font-normal text-muted-foreground"> ({film.year})</span>}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
              {film.imdbRating !== null && <ImdbRating value={film.imdbRating} />}
              {film.myRating !== null && <MyRating value={film.myRating} />}
              {watched && <span className="font-mono text-[10px]">{watched}</span>}
            </div>
          </div>
        </a>
      </WidgetCard>
    </motion.div>
  );
}

export function CodingCard({ coding }: { coding: Coding }) {
  const langs = coding.languages.map((l, i) => ({
    ...l,
    color: LANGUAGE_COLORS[l.name] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
  }));
  return (
    <motion.div {...appear}>
      <WidgetCard icon={<VscVscode className="size-3.5 text-[#007ACC]" />} label="VS Code · last 7 days">
        <p className="text-lg leading-tight font-bold tracking-tight">{coding.totalText}</p>
        {coding.dailyAverageText && (
          <p className="text-xs text-muted-foreground">{coding.dailyAverageText} daily average</p>
        )}
        {langs.length > 0 && (
          <>
            <div className="mt-3 flex h-1.5 gap-px overflow-hidden rounded-full bg-muted">
              {langs.map((l, i) => (
                <motion.span
                  key={l.name}
                  className="h-full"
                  style={{ backgroundColor: l.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${l.percent}%` }}
                  transition={{ duration: 0.7, delay: 0.2 + i * 0.08, ease: 'easeOut' }}
                />
              ))}
            </div>
            <ul className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1">
              {langs.map((l) => (
                <li key={l.name} className="flex min-w-0 items-center gap-1.5 text-[11px]">
                  <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: l.color }} />
                  <span className="truncate">{l.name}</span>
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">{Math.round(l.percent)}%</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </WidgetCard>
    </motion.div>
  );
}
