/**
 * Server-only Spotify "now playing" lookup. Never import this from `src/`:
 * it reads the client secret and refresh token from the environment.
 *
 * Required env vars: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN
 * (run `npm run spotify:auth` once to get the refresh token).
 */

export interface NowPlaying {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumArt: string | null;
  url: string;
  progressMs: number;
  durationMs: number;
  /** ISO time the track was last played, when it isn't playing now. */
  playedAt: string | null;
}

export type NowPlayingResult =
  | { status: 200; body: { track: NowPlaying | null } }
  | { status: 503; body: { error: 'not_configured' } }
  | { status: 502; body: { error: 'spotify_error'; detail: string } };

type Env = Record<string, string | undefined>;

interface SpotifyTrack {
  name: string;
  duration_ms: number;
  artists: { name: string }[];
  album: { name: string; images: { url: string; width: number }[] };
  external_urls: { spotify: string };
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(env: Env): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) return cachedToken.value;
  const basic = Buffer.from(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: env.SPOTIFY_REFRESH_TOKEN! }),
  });
  if (!res.ok) throw new Error(`token refresh failed (${res.status})`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

function toNowPlaying(track: SpotifyTrack, extra: Pick<NowPlaying, 'isPlaying' | 'progressMs' | 'playedAt'>): NowPlaying {
  // Pick the smallest cover that is still at least 128px wide.
  const images = [...track.album.images].sort((a, b) => a.width - b.width);
  const art = images.find((i) => i.width >= 128) ?? images.at(-1);
  return {
    title: track.name,
    artist: track.artists.map((a) => a.name).join(', '),
    album: track.album.name,
    albumArt: art?.url ?? null,
    url: track.external_urls.spotify,
    durationMs: track.duration_ms,
    ...extra,
  };
}

export async function getNowPlaying(env: Env): Promise<NowPlayingResult> {
  if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET || !env.SPOTIFY_REFRESH_TOKEN) {
    return { status: 503, body: { error: 'not_configured' } };
  }
  try {
    const token = await getAccessToken(env);
    const headers = { Authorization: `Bearer ${token}` };

    const current = await fetch('https://api.spotify.com/v1/me/player/currently-playing', { headers });
    if (current.status === 200) {
      const json = (await current.json()) as { is_playing: boolean; progress_ms: number | null; item: SpotifyTrack | null };
      if (json.item && json.is_playing) {
        return {
          status: 200,
          body: { track: toNowPlaying(json.item, { isPlaying: true, progressMs: json.progress_ms ?? 0, playedAt: null }) },
        };
      }
    } else if (current.status !== 204) {
      throw new Error(`currently-playing failed (${current.status})`);
    }

    // Nothing playing (or paused): fall back to the most recent track.
    const recent = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', { headers });
    if (!recent.ok) throw new Error(`recently-played failed (${recent.status})`);
    const json = (await recent.json()) as { items: { track: SpotifyTrack; played_at: string }[] };
    const last = json.items[0];
    return {
      status: 200,
      body: {
        track: last ? toNowPlaying(last.track, { isPlaying: false, progressMs: 0, playedAt: last.played_at }) : null,
      },
    };
  } catch (err) {
    return { status: 502, body: { error: 'spotify_error', detail: err instanceof Error ? err.message : String(err) } };
  }
}
