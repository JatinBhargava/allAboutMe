// Vercel serverless function: GET /api/qotd
import { getDailyQuestions } from '../server/qotd.js';

export async function GET() {
  try {
    return Response.json(await getDailyQuestions(), {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600' },
    });
  } catch {
    return Response.json({ error: 'unavailable' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
