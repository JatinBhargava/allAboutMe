/**
 * Daily questions, the same for every visitor:
 * - System design: from the Software Engineer Prep Ledger
 *   (fullstack-developer-study-kit.vercel.app), one picked per day (IST).
 * - DSA: LeetCode's daily challenge, falling back to a daily Codeforces pick.
 */

const BASE = 'https://fullstack-developer-study-kit.vercel.app/index.html';
const CACHE_MS = 6 * 60 * 60 * 1000;

export interface Question {
  question: string;
  track: string;
  day: number;
  dayTitle: string;
  url: string;
  study: { label: string; url: string } | null;
}

let cache: { at: number; questions: Question[] } | null = null;

const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&rarr;/g, '')
    .replace(/\s+/g, ' ')
    .trim();

function parse(html: string): Question[] {
  const questions: Question[] = [];
  for (const day of html.matchAll(/<article class="day" id="day-(\d+)"[\s\S]*?<\/article>/g)) {
    const n = Number(day[1]);
    const dayTitle = text(day[0].match(/<h3 class="day__t">([\s\S]*?)<\/h3>/)?.[1] ?? '');
    for (const trk of day[0].matchAll(/<section class="trk[^"]*"[\s\S]*?<\/section>/g)) {
      const q = trk[0].match(/<p class="trk__q">([\s\S]*?)<\/p>/)?.[1];
      if (!q) continue;
      const track = text(trk[0].match(/<button class="chk"[\s\S]*?<span>([^<]+)<\/span><\/button>/)?.[1] ?? '');
      const ref = trk[0].match(/<a class="ref" href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
      questions.push({
        question: text(q),
        track,
        day: n,
        dayTitle,
        url: `${BASE}#day-${n}`,
        study: ref ? { url: ref[1], label: text(ref[2].replace(/<span>[\s\S]*?<\/span>/, '')) } : null,
      });
    }
  }
  return questions;
}

async function load() {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.questions;
  const res = await fetch(BASE, { headers: { 'User-Agent': 'portfolio-qotd/1.0' } });
  if (!res.ok) throw new Error(`study kit responded ${res.status}`);
  const questions = parse(await res.text());
  if (questions.length === 0) throw new Error('no questions found (page layout changed?)');
  cache = { at: Date.now(), questions };
  return questions;
}

/** Days since 1970 in India time, so picks flip at midnight IST. */
const istDay = (now: Date) => Math.floor((now.getTime() + 5.5 * 3600_000) / 86_400_000);

export interface DsaProblem {
  title: string;
  url: string;
  difficulty: string;
  tags: string[];
  source: 'LeetCode' | 'Codeforces';
}

export interface DailyQuestions {
  systemDesign: Pick<Question, 'question' | 'dayTitle' | 'url' | 'study'> | null;
  dsa: DsaProblem | null;
}

async function systemDesignQuestion(now: Date) {
  const all = (await load()).filter((q) => q.track === 'System Design');
  if (all.length === 0) return null;
  // Step by a prime so consecutive days jump across weeks.
  const { question, dayTitle, url, study } = all[(istDay(now) * 37) % all.length];
  return { question, dayTitle, url, study };
}

async function leetcodeDaily(): Promise<DsaProblem> {
  const res = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com', 'User-Agent': 'Mozilla/5.0 portfolio-qotd' },
    body: JSON.stringify({
      query:
        'query { activeDailyCodingChallengeQuestion { link question { title difficulty topicTags { name } } } }',
    }),
  });
  if (!res.ok) throw new Error(`leetcode responded ${res.status}`);
  const json = (await res.json()) as {
    data?: { activeDailyCodingChallengeQuestion?: { link: string; question: { title: string; difficulty: string; topicTags: { name: string }[] } } };
  };
  const daily = json.data?.activeDailyCodingChallengeQuestion;
  if (!daily) throw new Error('leetcode: no daily question');
  return {
    title: daily.question.title,
    url: `https://leetcode.com${daily.link}`,
    difficulty: daily.question.difficulty,
    tags: daily.question.topicTags.slice(0, 3).map((t) => t.name),
    source: 'LeetCode',
  };
}

let cfCache: { at: number; problems: { contestId: number; index: string; name: string; rating: number; tags: string[] }[] } | null = null;

async function codeforcesDaily(now: Date): Promise<DsaProblem> {
  if (!cfCache || Date.now() - cfCache.at > CACHE_MS) {
    const res = await fetch('https://codeforces.com/api/problemset.problems');
    if (!res.ok) throw new Error(`codeforces responded ${res.status}`);
    const json = (await res.json()) as { result: { problems: { contestId: number; index: string; name: string; rating?: number; tags: string[] }[] } };
    const problems = json.result.problems
      .filter((p): p is typeof p & { rating: number } => !!p.rating && p.rating >= 1200 && p.rating <= 1800)
      .sort((a, b) => a.contestId - b.contestId || a.index.localeCompare(b.index));
    cfCache = { at: Date.now(), problems };
  }
  const p = cfCache.problems[(istDay(now) * 7919) % cfCache.problems.length];
  return {
    title: p.name,
    url: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
    difficulty: `Rated ${p.rating}`,
    tags: p.tags.slice(0, 3),
    source: 'Codeforces',
  };
}

async function dsaProblem(now: Date) {
  try {
    return await leetcodeDaily();
  } catch {
    return codeforcesDaily(now);
  }
}

export async function getDailyQuestions(now = new Date()): Promise<DailyQuestions> {
  const [systemDesign, dsa] = await Promise.all([
    systemDesignQuestion(now).catch(() => null),
    dsaProblem(now).catch(() => null),
  ]);
  return { systemDesign, dsa };
}
