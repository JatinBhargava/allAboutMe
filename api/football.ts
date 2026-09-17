// Vercel serverless function: GET /api/football
import { getLiverpool } from '../server/football.js';

export async function GET() {
  try {
    const data = await getLiverpool();
    // Short cache while a match is live, longer otherwise.
    const maxAge = data.live ? 20 : 300;
    return Response.json(data, {
      headers: { 'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge}` },
    });
  } catch {
    return Response.json({ error: 'unavailable' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
