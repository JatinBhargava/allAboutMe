import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import WidgetCard from './WidgetCard';

// Mirrors the types in server/football.ts.
interface MatchSide {
  name: string;
  short: string;
  logo: string | null;
  score: string | null;
  isLiverpool: boolean;
}
interface Match {
  id: string;
  state: 'pre' | 'in' | 'post';
  kickoff: string;
  competition: string;
  venue: string | null;
  detail: string;
  home: MatchSide;
  away: MatchSide;
  url: string | null;
}
interface FootballView {
  live: Match | null;
  next: Match | null;
  last: Match | null;
}

const LFC_CREST = 'https://a.espncdn.com/combiner/i?img=%2Fi%2Fteamlogos%2Fsoccer%2F500%2F364.png&w=40&h=40';

/** Polls faster while a match is live or about to start. */
function useLiverpool() {
  const [data, setData] = useState<FootballView | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    const load = async () => {
      let delay = 5 * 60_000;
      try {
        const res = await fetch('/api/football', { cache: 'no-store' });
        if (res.ok) {
          const json = (await res.json()) as FootballView;
          if (cancelled) return;
          setData(json);
          const untilKickoff = json.next ? new Date(json.next.kickoff).getTime() - Date.now() : Infinity;
          if (json.live || untilKickoff < 10 * 60_000) delay = 30_000;
        }
      } catch {
        // Keep showing the last data.
      }
      if (!cancelled && document.visibilityState === 'visible') timer = window.setTimeout(load, delay);
    };
    const onVisible = () => {
      window.clearTimeout(timer);
      if (document.visibilityState === 'visible') void load();
    };
    void load();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return data;
}

function useMinuteTick() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

function countdown(kickoff: string, now: number) {
  const mins = Math.round((new Date(kickoff).getTime() - now) / 60_000);
  if (mins <= 0) return 'Kicking off';
  const d = Math.floor(mins / 1440);
  const h = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  if (d > 0) return `in ${d}d ${h}h`;
  if (h > 0) return `in ${h}h ${m}m`;
  return `in ${m}m`;
}

const kickoffText = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

function Crest({ side, size = 'size-9' }: { side: MatchSide; size?: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center">
      <div className={cn('flex items-center justify-center', size)}>
        {side.logo ? (
          <img src={side.logo} alt="" loading="lazy" className="size-full object-contain" />
        ) : (
          <span className="size-full rounded-full bg-muted" />
        )}
      </div>
      <span className={cn('w-full truncate text-[11px] leading-tight', side.isLiverpool ? 'font-semibold' : 'text-muted-foreground')}>
        {side.short}
      </span>
    </div>
  );
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-1.5 py-px text-[9px] font-bold tracking-wider text-white">
      <motion.span
        className="size-1.5 rounded-full bg-white"
        animate={{ opacity: [1, 0.2, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
      LIVE
    </span>
  );
}

export default function LiverpoolCard({ className }: { className?: string }) {
  const data = useLiverpool();
  const now = useMinuteTick();
  const match = data?.live ?? data?.next ?? null;
  if (!data || !match) return null;

  const live = match.state === 'in';
  const Wrapper = match.url ? 'a' : 'div';

  return (
    <WidgetCard
      className={className}
      icon={<img src={LFC_CREST} alt="" className="size-3.5 object-contain" />}
      label={live ? 'Liverpool · live' : 'Liverpool · next match'}
      trailing={live ? <LiveBadge /> : undefined}
    >
      <Wrapper
        {...(match.url ? { href: match.url, target: '_blank', rel: 'noreferrer' } : {})}
        className="group block"
        aria-label={`${match.home.name} vs ${match.away.name}, ${match.competition}`}
      >
        <p className="mb-2 truncate text-center text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
          {match.competition}
        </p>
        <div className="flex items-center gap-1">
          <Crest side={match.home} />
          <div className="flex w-16 shrink-0 flex-col items-center">
            <AnimatePresence mode="popLayout" initial={false}>
              {live ? (
                <motion.span
                  key={`${match.home.score}-${match.away.score}`}
                  initial={{ scale: 1.4, opacity: 0.4 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-xl leading-none font-extrabold text-foreground tabular-nums"
                >
                  {match.home.score}–{match.away.score}
                </motion.span>
              ) : (
                <motion.span key="vs" className="text-xs font-semibold text-muted-foreground">
                  vs
                </motion.span>
              )}
            </AnimatePresence>
            <span
              className={cn('mt-1 font-mono text-[10px] tabular-nums', live ? 'font-semibold text-red-600' : 'text-muted-foreground')}
            >
              {live ? match.detail : countdown(match.kickoff, now)}
            </span>
          </div>
          <Crest side={match.away} />
        </div>
        {!live && (
          <p className="mt-2 text-center text-[11px] leading-snug">
            <span className="font-medium">{kickoffText(match.kickoff)}</span>
            {match.venue && <span className="block truncate text-[10px] text-muted-foreground">{match.venue}</span>}
          </p>
        )}
      </Wrapper>

      {data.last && !live && (
        <p className="mt-2.5 flex items-center justify-center gap-1.5 border-t pt-2 text-[10px] text-muted-foreground">
          <span>Last:</span>
          <span className={cn(data.last.home.isLiverpool && 'font-semibold text-foreground')}>{data.last.home.short}</span>
          <span className="font-mono font-semibold text-foreground tabular-nums">
            {data.last.home.score}–{data.last.away.score}
          </span>
          <span className={cn(data.last.away.isLiverpool && 'font-semibold text-foreground')}>{data.last.away.short}</span>
        </p>
      )}
    </WidgetCard>
  );
}
