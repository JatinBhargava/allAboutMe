// Vercel serverless function: GET /api/activity
import { getActivity } from '../server/activity';

export async function GET() {
  const activity = await getActivity(process.env);
  return Response.json(activity, {
    // Books, films and weekly totals change slowly; cache for 30 minutes at the edge.
    headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' },
  });
}
