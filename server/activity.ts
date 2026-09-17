/**
 * Server-only "what I'm up to" lookups: current book (Goodreads RSS),
 * last watched title (IMDb link + OMDb details) and weekly coding time (WakaTime).
 *
 * Env vars (each card is independent; leave one unset to hide that card):
 *   GOODREADS_USER_ID     numeric id, or your whole Goodreads profile URL
 *   IMDB_LAST_WATCHED     IMDb link or id (tt1234567) of what you last watched
 *   OMDB_API_KEY          free key (or the sample link from its email) from https://www.omdbapi.com/apikey.aspx
 *   IMDB_MY_RATING        optional, your rating out of 10
 *   IMDB_WATCHED_ON       optional, YYYY-MM-DD
 *   WAKATIME_API_KEY      from https://wakatime.com/settings/api-key
 */

export interface Book {
  title: string;
  author: string;
  cover: string | null;
  url: string;
}

export interface Film {
  title: string;
  year: string | null;
  poster: string | null;
  url: string;
  /** Your rating out of 10, when set. */
  myRating: number | null;
  /** IMDb's average rating out of 10. */
  imdbRating: number | null;
  watchedOn: string | null;
}

export interface Coding {
  totalText: string;
  dailyAverageText: string;
  languages: { name: string; percent: number }[];
  editor: string | null;
}

export interface Activity {
  reading: Book | null;
  watched: Film | null;
  coding: Coding | null;
}

type Env = Record<string, string | undefined>;

const decode = (s: string) =>
  s
    .replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .trim();

/** Minimal RSS reader: good enough for the well-formed Goodreads feed. */
function rssItems(xml: string) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => {
    const body = m[1];
    return (tag: string) => {
      const found = body.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`));
      return found ? decode(found[1]) : null;
    };
  });
}

async function fetchText(url: string) {
  const res = await fetch(url, { headers: { 'User-Agent': 'portfolio-activity/1.0' } });
  if (!res.ok) throw new Error(`${new URL(url).host} responded ${res.status}`);
  return res.text();
}

/** Accepts "12345678", "12345678-name" or a full goodreads.com/user/show/... URL. */
function goodreadsUserId(value: string) {
  const id = value.match(/user\/show\/(\d+)/)?.[1] ?? value.match(/^\s*(\d+)/)?.[1];
  if (!id) throw new Error('GOODREADS_USER_ID should be your numeric id or profile URL');
  return id;
}

async function getReading(value: string): Promise<Book | null> {
  const userId = goodreadsUserId(value);
  const xml = await fetchText(
    `https://www.goodreads.com/review/list_rss/${encodeURIComponent(userId)}?shelf=currently-reading`,
  );
  const item = rssItems(xml)[0];
  if (!item) return null;
  return {
    title: item('title') ?? 'Untitled',
    author: item('author_name') ?? '',
    cover: item('book_large_image_url') ?? item('book_medium_image_url') ?? item('book_image_url'),
    // The feed adds utm_* tracking parameters to links; drop them.
    url: item('link')?.split('?')[0] ?? `https://www.goodreads.com/user/show/${userId}`,
  };
}

// IMDb has no public API or feed for watch history (and blocks server requests),
// so the title is set by hand and OMDb supplies the details by IMDb id.
async function getWatched(env: Env): Promise<Film | null> {
  const id = env.IMDB_LAST_WATCHED!.match(/tt\d{7,}/)?.[0];
  if (!id) throw new Error('IMDB_LAST_WATCHED should be an IMDb title link or id like tt1234567');
  // Accept the bare key or the sample link from OMDb's email (…?i=tt…&apikey=KEY).
  const apiKey = env.OMDB_API_KEY?.match(/apikey=([^&\s]+)/)?.[1] ?? env.OMDB_API_KEY?.trim();
  if (!apiKey) throw new Error('OMDB_API_KEY is required to show the IMDb title');

  const res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${encodeURIComponent(apiKey)}`);
  if (res.status === 401) throw new Error('OMDb rejected the key (check it, and click the activation link in the OMDb email)');
  if (!res.ok) throw new Error(`omdb responded ${res.status}`);
  const data = (await res.json()) as {
    Response: 'True' | 'False';
    Error?: string;
    Title?: string;
    Year?: string;
    Poster?: string;
    imdbRating?: string;
  };
  if (data.Response !== 'True') throw new Error(`omdb: ${data.Error}`);

  const num = (v: string | undefined) => (v && !Number.isNaN(Number(v)) ? Number(v) : null);
  return {
    title: data.Title ?? id,
    // Series come back as "2019–2023"; keep it as IMDb shows it.
    year: data.Year ?? null,
    poster: data.Poster && data.Poster !== 'N/A' ? data.Poster : null,
    url: `https://www.imdb.com/title/${id}/`,
    myRating: num(env.IMDB_MY_RATING),
    imdbRating: num(data.imdbRating),
    watchedOn: /^\d{4}-\d{2}-\d{2}$/.test(env.IMDB_WATCHED_ON ?? '') ? env.IMDB_WATCHED_ON! : null,
  };
}

async function getCoding(apiKey: string): Promise<Coding | null> {
  const res = await fetch('https://wakatime.com/api/v1/users/current/stats/last_7_days', {
    headers: { Authorization: `Basic ${Buffer.from(apiKey).toString('base64')}` },
  });
  if (!res.ok) throw new Error(`wakatime responded ${res.status}`);
  const { data } = (await res.json()) as {
    data: {
      human_readable_total?: string;
      human_readable_daily_average?: string;
      languages?: { name: string; percent: number }[];
      editors?: { name: string; percent: number }[];
    };
  };
  if (!data.human_readable_total) return null; // stats still being computed
  return {
    totalText: data.human_readable_total,
    dailyAverageText: data.human_readable_daily_average ?? '',
    languages: (data.languages ?? []).slice(0, 4).map((l) => ({ name: l.name, percent: l.percent })),
    editor: data.editors?.[0]?.name ?? null,
  };
}

/** Runs one lookup; a failing or unconfigured source just hides its card. */
async function settle<T>(key: string | undefined, fn: (key: string) => Promise<T | null>, label: string) {
  if (!key) return null;
  try {
    return await fn(key);
  } catch (err) {
    console.warn(`[activity] ${label}:`, err instanceof Error ? err.message : err);
    return null;
  }
}

export async function getActivity(env: Env): Promise<Activity> {
  const [reading, watched, coding] = await Promise.all([
    settle(env.GOODREADS_USER_ID, getReading, 'goodreads'),
    settle(env.IMDB_LAST_WATCHED, () => getWatched(env), 'imdb'),
    settle(env.WAKATIME_API_KEY, getCoding, 'wakatime'),
  ]);
  return { reading, watched, coding };
}
