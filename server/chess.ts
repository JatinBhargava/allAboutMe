/**
 * Correspondence chess: Jatin (white, moves first) vs everyone visiting the site (black).
 * No clock. Every move is stored; when a game ends the result is added to the
 * scoreboard and the move list is cleared for the next game.
 *
 * Env: CHESS_OWNER_KEY (secret that lets Jatin move for white), plus the store
 * settings described in server/store.ts.
 */
import crypto from 'node:crypto';
import { Chess } from 'chess.js';
import { getStore } from './store';

type Env = Record<string, string | undefined>;
type Side = 'visitors' | 'owner';

interface ChessDoc {
  gameNumber: number;
  /** SAN moves of the game in progress. */
  moves: string[];
  records: { owner: number; visitors: number; draws: number };
  lastResult: { winner: Side | 'draw'; reason: string; moves: number; endedAt: string } | null;
  updatedAt: string | null;
}

export interface ChessView {
  version: number;
  gameNumber: number;
  fen: string;
  moves: string[];
  lastMove: { from: string; to: string } | null;
  turn: Side;
  inCheck: boolean;
  records: ChessDoc['records'];
  lastResult: ChessDoc['lastResult'];
  updatedAt: string | null;
  youAre: Side;
}

export interface ChessRequest {
  method: string;
  body: unknown;
  ownerKey: string | null;
}

type Result = { status: number; body: unknown };

const KEY = 'portfolio:chess';
const EMPTY: ChessDoc = {
  gameNumber: 1,
  moves: [],
  records: { owner: 0, visitors: 0, draws: 0 },
  lastResult: null,
  updatedAt: null,
};

// Jatin plays white, visitors play black.
const sideToMove = (game: Chess): Side => (game.turn() === 'w' ? 'owner' : 'visitors');

function replay(moves: string[]) {
  const game = new Chess();
  for (const san of moves) game.move(san);
  return game;
}

function isOwner(env: Env, key: string | null) {
  if (!env.CHESS_OWNER_KEY || !key) return false;
  const a = crypto.createHash('sha256').update(key).digest();
  const b = crypto.createHash('sha256').update(env.CHESS_OWNER_KEY).digest();
  return crypto.timingSafeEqual(a, b);
}

function view(doc: ChessDoc, version: number, youAre: Side): ChessView {
  const game = replay(doc.moves);
  const last = game.history({ verbose: true }).at(-1);
  return {
    version,
    gameNumber: doc.gameNumber,
    fen: game.fen(),
    moves: doc.moves,
    lastMove: last ? { from: last.from, to: last.to } : null,
    turn: sideToMove(game),
    inCheck: game.inCheck(),
    records: doc.records,
    lastResult: doc.lastResult,
    updatedAt: doc.updatedAt,
    youAre,
  };
}

function gameOver(game: Chess): { winner: Side | 'draw'; reason: string } | null {
  if (game.isCheckmate()) {
    // The side that just moved delivered mate.
    return { winner: game.turn() === 'w' ? 'visitors' : 'owner', reason: 'checkmate' };
  }
  if (game.isStalemate()) return { winner: 'draw', reason: 'stalemate' };
  if (game.isInsufficientMaterial()) return { winner: 'draw', reason: 'insufficient material' };
  if (game.isThreefoldRepetition()) return { winner: 'draw', reason: 'threefold repetition' };
  if (game.isDraw()) return { winner: 'draw', reason: '50-move rule' };
  return null;
}

interface MoveBody {
  action: 'move';
  from: string;
  to: string;
  promotion?: string;
  version: number;
}

function parseBody(body: unknown): MoveBody | { action: 'reset'; version: number } | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  if (typeof b.version !== 'number') return null;
  if (b.action === 'reset') return { action: 'reset', version: b.version };
  const square = /^[a-h][1-8]$/;
  if (b.action === 'move' && typeof b.from === 'string' && typeof b.to === 'string' && square.test(b.from) && square.test(b.to)) {
    const promotion = typeof b.promotion === 'string' && /^[qrbn]$/.test(b.promotion) ? b.promotion : undefined;
    return { action: 'move', from: b.from, to: b.to, promotion, version: b.version };
  }
  return null;
}

export async function handleChess(env: Env, req: ChessRequest): Promise<Result> {
  const store = getStore(env);
  if (!store) return { status: 503, body: { error: 'not_configured' } };

  const youAre: Side = isOwner(env, req.ownerKey) ? 'owner' : 'visitors';
  const stored = await store.get<ChessDoc>(KEY);
  const doc = stored?.value ?? EMPTY;
  const version = stored?.version ?? 0;

  if (req.method === 'GET') return { status: 200, body: view(doc, version, youAre) };
  if (req.method !== 'POST') return { status: 405, body: { error: 'method_not_allowed' } };

  const action = parseBody(req.body);
  if (!action) return { status: 400, body: { error: 'bad_request' } };
  // Someone else moved first: send the fresh state so the client can resync.
  if (action.version !== version) return { status: 409, body: { error: 'stale', state: view(doc, version, youAre) } };

  let next: ChessDoc;
  if (action.action === 'reset') {
    if (youAre !== 'owner') return { status: 403, body: { error: 'owner_only' } };
    next = { ...doc, moves: [], updatedAt: new Date().toISOString() };
  } else {
    const game = replay(doc.moves);
    if (sideToMove(game) !== youAre) return { status: 403, body: { error: 'not_your_turn' } };
    let san: string;
    try {
      san = game.move({ from: action.from, to: action.to, promotion: action.promotion ?? 'q' }).san;
    } catch {
      return { status: 422, body: { error: 'illegal_move' } };
    }
    const now = new Date().toISOString();
    const over = gameOver(game);
    if (over) {
      const records = { ...doc.records };
      if (over.winner === 'draw') records.draws += 1;
      else records[over.winner] += 1;
      next = {
        gameNumber: doc.gameNumber + 1,
        moves: [], // start over; the finished game's moves are not kept
        records,
        lastResult: { ...over, moves: Math.ceil((doc.moves.length + 1) / 2), endedAt: now },
        updatedAt: now,
      };
    } else {
      next = { ...doc, moves: [...doc.moves, san], updatedAt: now };
    }
  }

  if (!(await store.setIfVersion(KEY, version, next))) {
    const fresh = await store.get<ChessDoc>(KEY);
    return { status: 409, body: { error: 'stale', state: view(fresh?.value ?? EMPTY, fresh?.version ?? 0, youAre) } };
  }
  return { status: 200, body: view(next, version + 1, youAre) };
}
