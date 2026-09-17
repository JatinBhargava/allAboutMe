/**
 * Liverpool's next / live match from ESPN's public site API (no key needed).
 * Team 364 = Liverpool. "all" covers every competition (league, cups, Europe).
 */

const TEAM_ID = '364';
const BASE = `https://site.api.espn.com/apis/site/v2/sports/soccer/all/teams/${TEAM_ID}/schedule`;

export interface MatchSide {
  name: string;
  short: string;
  logo: string | null;
  score: string | null;
  isLiverpool: boolean;
}

export interface Match {
  id: string;
  state: 'pre' | 'in' | 'post';
  kickoff: string;
  competition: string;
  venue: string | null;
  /** e.g. "67'", "HT", "FT" */
  detail: string;
  home: MatchSide;
  away: MatchSide;
  url: string | null;
}

export interface FootballView {
  live: Match | null;
  next: Match | null;
  last: Match | null;
}

interface EspnCompetitor {
  homeAway: 'home' | 'away';
  score?: string | { displayValue?: string };
  team: { id: string; displayName: string; shortDisplayName?: string; abbreviation?: string; logos?: { href: string }[] };
}

interface EspnEvent {
  id: string;
  date: string;
  league?: { abbreviation?: string; name?: string };
  links?: { href: string }[];
  competitions: {
    venue?: { fullName?: string };
    competitors: EspnCompetitor[];
    status: { displayClock?: string; type: { state: 'pre' | 'in' | 'post'; shortDetail?: string; completed?: boolean } };
  }[];
}

/** Resized crest via ESPN's image combiner (the originals are 500px). */
const smallLogo = (href?: string) =>
  href ? `https://a.espncdn.com/combiner/i?img=${encodeURIComponent(new URL(href).pathname)}&w=80&h=80` : null;

function side(c: EspnCompetitor | undefined, showScore: boolean): MatchSide {
  const score = typeof c?.score === 'string' ? c.score : (c?.score?.displayValue ?? null);
  return {
    name: c?.team.displayName ?? 'TBD',
    short: c?.team.shortDisplayName ?? c?.team.abbreviation ?? c?.team.displayName ?? 'TBD',
    logo: smallLogo(c?.team.logos?.[0]?.href),
    score: showScore ? (score ?? '0') : null,
    isLiverpool: c?.team.id === TEAM_ID,
  };
}

function toMatch(e: EspnEvent): Match {
  const comp = e.competitions[0];
  const state = comp.status.type.state;
  const detail =
    state === 'in' ? (comp.status.type.shortDetail ?? comp.status.displayClock ?? 'Live') : (comp.status.type.shortDetail ?? '');
  return {
    id: e.id,
    state,
    kickoff: e.date,
    competition: e.league?.abbreviation ?? e.league?.name ?? '',
    venue: comp.venue?.fullName ?? null,
    detail,
    home: side(comp.competitors.find((c) => c.homeAway === 'home'), state !== 'pre'),
    away: side(comp.competitors.find((c) => c.homeAway === 'away'), state !== 'pre'),
    url: e.links?.[0]?.href ?? null,
  };
}

async function events(url: string) {
  const res = await fetch(url, { headers: { 'User-Agent': 'portfolio-football/1.0' } });
  if (!res.ok) throw new Error(`espn responded ${res.status}`);
  const json = (await res.json()) as { events?: EspnEvent[] };
  return (json.events ?? []).filter((e) => e.competitions?.length);
}

export async function getLiverpool(): Promise<FootballView> {
  const [fixtures, results] = await Promise.all([
    events(`${BASE}?fixture=true`),
    events(BASE).catch(() => [] as EspnEvent[]),
  ]);
  const all = [...fixtures, ...results].map(toMatch);
  const byDate = (a: Match, b: Match) => a.kickoff.localeCompare(b.kickoff);

  const live = all.find((m) => m.state === 'in') ?? null;
  const next = all.filter((m) => m.state === 'pre').sort(byDate)[0] ?? null;
  const last = all.filter((m) => m.state === 'post').sort(byDate).at(-1) ?? null;
  return { live, next, last };
}
