import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import { SiSpotify } from 'react-icons/si';
import { cn } from '@/lib/utils';
import WidgetCard from '@/components/side/WidgetCard';
import SpotifyMiniPlayer, { spotifyUri, type SpotifyController } from '@/components/side/SpotifyMiniPlayer';

// Mirrors `NowPlaying` in server/spotify.ts (kept separate so no server code is bundled).
interface Track {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumArt: string | null;
  url: string;
  progressMs: number;
  durationMs: number;
  playedAt: string | null;
}

type State =
  | { kind: 'loading' }
  | { kind: 'offline' }
  | { kind: 'ready'; track: Track | null; receivedAt: number };

const POLL_MS = 20_000;
const SPOTIFY_GREEN = '#1DB954';

function formatTime(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function timeAgo(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
}

function useNowPlaying() {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    const load = async () => {
      try {
        const res = await fetch('/api/now-playing', { cache: 'no-store' });
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as { track: Track | null };
        if (!cancelled) setState({ kind: 'ready', track: json.track, receivedAt: Date.now() });
      } catch {
        if (!cancelled) setState((s) => (s.kind === 'ready' ? s : { kind: 'offline' }));
      }
    };
    const schedule = () => {
      window.clearInterval(timer);
      if (document.visibilityState === 'visible') {
        void load();
        timer = window.setInterval(load, POLL_MS);
      }
    };
    schedule();
    document.addEventListener('visibilitychange', schedule);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', schedule);
    };
  }, []);

  return state;
}

/** Ticks once a second so the progress bar moves between polls. */
function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [active]);
  return now;
}

function Equalizer() {
  return (
    <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
      {[0, 0.25, 0.5].map((delay) => (
        <motion.span
          key={delay}
          className="w-[3px] rounded-full"
          style={{ backgroundColor: SPOTIFY_GREEN }}
          animate={{ height: ['30%', '100%', '45%', '80%', '30%'] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut', delay }}
        />
      ))}
    </span>
  );
}

export default function SpotifyWidget({ className }: { className?: string }) {
  const state = useNowPlaying();
  const track = state.kind === 'ready' ? state.track : null;
  const receivedAt = state.kind === 'ready' ? state.receivedAt : 0;
  const playing = !!track?.isPlaying;
  const now = useNow(playing);
  const progress = track && playing ? Math.min(track.durationMs, track.progressMs + (now - receivedAt)) : 0;

  // Visitor-side playback in the floating embed.
  const [playerUri, setPlayerUri] = useState<string | null>(null);
  const [listenerPaused, setListenerPaused] = useState(true);
  const controllerRef = useRef<SpotifyController | null>(null);
  const trackUri = track ? spotifyUri(track.url) : null;
  const listening = !!trackUri && playerUri === trackUri && !listenerPaused;

  const onListen = () => {
    if (!trackUri) return;
    if (playerUri === trackUri && controllerRef.current) controllerRef.current.togglePlay();
    else setPlayerUri(trackUri); // opens the player, or switches it to this track
  };

  return (
    <WidgetCard
      className={className}
      icon={<SiSpotify className="size-3.5" style={{ color: SPOTIFY_GREEN }} />}
      label={playing ? 'Now playing' : track ? 'Last played' : 'Spotify'}
      trailing={playing && <Equalizer />}
    >
      <AnimatePresence mode="wait" initial={false}>
        {track ? (
          <motion.div
            key={track.url}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center gap-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-black/5">
                {track.albumArt && (
                  <motion.img
                    src={track.albumArt}
                    alt={`${track.album} cover`}
                    className={cn('size-full object-cover', !playing && 'grayscale-[40%]')}
                    animate={playing ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                    transition={{ duration: 6, repeat: playing ? Infinity : 0, ease: 'easeInOut' }}
                  />
                )}
                {trackUri && (
                  <button
                    type="button"
                    onClick={onListen}
                    aria-label={listening ? `Pause ${track.title}` : `Play ${track.title}`}
                    title={listening ? 'Pause' : 'Listen on this page'}
                    className={cn(
                      'group/play absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/30 focus-visible:bg-black/30',
                      listening && 'bg-black/30',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-7 items-center justify-center rounded-full text-black shadow-md transition-all group-hover/play:scale-110',
                        listening ? 'opacity-100' : 'opacity-90',
                      )}
                      style={{ backgroundColor: SPOTIFY_GREEN }}
                    >
                      {listening ? <Pause className="size-3.5 fill-current" /> : <Play className="ml-0.5 size-3.5 fill-current" />}
                    </span>
                  </button>
                )}
              </div>
              <div className="min-w-0">
                <a
                  href={track.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate text-sm font-semibold hover:underline"
                >
                  {track.title}
                </a>
                <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
                {!playing && track.playedAt && (
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{timeAgo(track.playedAt)}</p>
                )}
              </div>
            </div>

            {playing && (
              <div className="mt-2.5">
                <div className="h-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-[width] duration-1000 ease-linear"
                    style={{ width: `${(progress / track.durationMs) * 100}%`, backgroundColor: SPOTIFY_GREEN }}
                  />
                </div>
                <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground tabular-nums">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(track.durationMs)}</span>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={state.kind}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3"
          >
            <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted">
              <SiSpotify className={cn('size-6', state.kind === 'loading' && 'animate-pulse')} style={{ color: SPOTIFY_GREEN }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{state.kind === 'loading' ? 'Tuning in…' : 'Not playing'}</p>
              <p className="text-xs text-muted-foreground">
                {state.kind === 'loading' ? 'Checking Spotify' : 'Offline right now'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {playerUri && (
          <SpotifyMiniPlayer
            uri={playerUri}
            controllerRef={controllerRef}
            onPausedChange={setListenerPaused}
            onClose={() => setPlayerUri(null)}
          />
        )}
      </AnimatePresence>
    </WidgetCard>
  );
}
