// Vercel serverless function: GET/POST /api/chess
import { handleChess } from '../server/chess.js';

async function respond(request: Request) {
  let body: unknown = null;
  if (request.method === 'POST') {
    try {
      body = await request.json();
    } catch {
      body = null;
    }
  }
  const result = await handleChess(process.env, {
    method: request.method,
    body,
    ownerKey: request.headers.get('x-chess-owner'),
  });
  return Response.json(result.body, { status: result.status, headers: { 'Cache-Control': 'no-store' } });
}

export const GET = respond;
export const POST = respond;
