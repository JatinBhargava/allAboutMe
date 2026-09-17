// Vercel serverless function: GET /api/now-playing
import { getNowPlaying } from '../server/spotify';

export async function GET() {
  const result = await getNowPlaying(process.env);
  return Response.json(result.body, {
    status: result.status,
    headers: {
      // Let the CDN absorb traffic; the widget polls every ~20s anyway.
      'Cache-Control': result.status === 200 ? 'public, s-maxage=10, stale-while-revalidate=20' : 'no-store',
    },
  });
}
