import { useEffect, useRef, type MutableRefObject } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { SiSpotify } from 'react-icons/si';

/*
 * Floating Spotify embed driven by Spotify's iFrame API
 * (https://developer.spotify.com/documentation/embeds/references/iframe-api).
 * Visitors logged in to Spotify hear the full track; everyone else gets a 30s preview.
 */

export interface SpotifyController {
  loadUri: (uri: string) => void;
  play: () => void;
  togglePlay: () => void;
  destroy: () => void;
  addListener: (event: string, cb: (e: { data: { isPaused?: boolean } }) => void) => void;
}

interface IFrameAPI {
  createController: (
    element: HTMLElement,
    options: { uri: string; width?: string | number; height?: string | number },
    callback: (controller: SpotifyController) => void,
  ) => void;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: IFrameAPI) => void;
  }
}

let apiPromise: Promise<IFrameAPI> | null = null;

function loadIframeApi() {
  apiPromise ??= new Promise<IFrameAPI>((resolve, reject) => {
    window.onSpotifyIframeApiReady = resolve;
    const script = document.createElement('script');
    script.src = 'https://open.spotify.com/embed/iframe-api/v1';
    script.async = true;
    script.onerror = () => {
      apiPromise = null;
      reject(new Error('Could not load the Spotify player'));
    };
    document.body.appendChild(script);
  });
  return apiPromise;
}

/** "https://open.spotify.com/track/abc?si=…" → "spotify:track:abc" */
export function spotifyUri(url: string) {
  const match = url.match(/open\.spotify\.com\/(track|episode)\/([A-Za-z0-9]+)/);
  return match ? `spotify:${match[1]}:${match[2]}` : null;
}

interface SpotifyMiniPlayerProps {
  uri: string;
  controllerRef: MutableRefObject<SpotifyController | null>;
  onPausedChange: (paused: boolean) => void;
  onClose: () => void;
}

export default function SpotifyMiniPlayer({ uri, controllerRef, onPausedChange, onClose }: SpotifyMiniPlayerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const loadedUri = useRef<string | null>(null);
  // Keep the latest callback without re-creating the player.
  const onPausedRef = useRef(onPausedChange);
  onPausedRef.current = onPausedChange;

  // Create the player once.
  useEffect(() => {
    let cancelled = false;
    let controller: SpotifyController | null = null;
    // The API replaces this element with its iframe, so give it one React doesn't own.
    const host = hostRef.current;
    const target = document.createElement('div');
    host?.appendChild(target);

    loadIframeApi()
      .then((api) => {
        if (cancelled) return;
        api.createController(target, { uri, width: '100%', height: 80 }, (c) => {
          if (cancelled) return c.destroy();
          controller = c;
          controllerRef.current = c;
          loadedUri.current = uri;
          // Every (re)load was started by a click, so start playing as soon as it's ready.
          c.addListener('ready', () => c.play());
          c.addListener('playback_update', (e) => onPausedRef.current(e.data.isPaused ?? true));
        });
      })
      .catch(() => onClose());

    return () => {
      cancelled = true;
      controller?.destroy();
      host?.replaceChildren();
      controllerRef.current = null;
      onPausedRef.current(true);
    };
    // Created once on purpose; uri changes are handled by the effect below.
  }, []);

  // Switch tracks in place.
  useEffect(() => {
    const controller = controllerRef.current;
    if (controller && loadedUri.current && loadedUri.current !== uri) {
      loadedUri.current = uri;
      controller.loadUri(uri);
    }
  }, [uri, controllerRef]);

  return createPortal(
    <motion.div
      role="region"
      aria-label="Spotify player"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="fixed bottom-4 left-2 z-40 w-[296px] rounded-2xl border bg-background/95 p-1.5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.25)] backdrop-blur"
    >
      <div className="mb-1.5 flex items-center gap-1.5 px-1 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
        <SiSpotify className="size-3.5 text-[#1DB954]" />
        Listening along
        <button
          type="button"
          onClick={onClose}
          aria-label="Close player"
          className="ml-auto flex size-6 items-center justify-center rounded-full hover:bg-muted hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <div ref={hostRef} className="h-20 overflow-hidden rounded-xl bg-muted [&_iframe]:block [&_iframe]:rounded-xl" />
    </motion.div>,
    document.body,
  );
}
