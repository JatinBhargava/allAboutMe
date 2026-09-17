import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Chess, type Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { RotateCcw } from 'lucide-react';
import { GiChessKnight } from 'react-icons/gi';
import { cn } from '@/lib/utils';
import WidgetCard from './WidgetCard';

// Mirrors `ChessView` in server/chess.ts.
type Side = 'visitors' | 'owner';
interface ChessView {
  version: number;
  gameNumber: number;
  fen: string;
  moves: string[];
  lastMove: { from: string; to: string } | null;
  turn: Side;
  inCheck: boolean;
  records: { owner: number; visitors: number; draws: number };
  lastResult: { winner: Side | 'draw'; reason: string; moves: number; endedAt: string } | null;
  updatedAt: string | null;
  youAre: Side;
}

const OWNER_KEY_STORAGE = 'chess-owner-key';
const POLL_MS = 10_000;
const BOARD_WIDTH = 176;

/** Reads `?chess-owner=…` once, remembers it in this browser, and strips it from the URL. */
function useOwnerKey() {
  const [key] = useState<string | null>(() => {
    try {
      const url = new URL(window.location.href);
      const fromUrl = url.searchParams.get('chess-owner');
      if (fromUrl) {
        localStorage.setItem(OWNER_KEY_STORAGE, fromUrl);
        url.searchParams.delete('chess-owner');
        window.history.replaceState(null, '', url.toString());
        return fromUrl;
      }
      return localStorage.getItem(OWNER_KEY_STORAGE);
    } catch {
      return null;
    }
  });
  return key;
}

function useChessGame() {
  const ownerKey = useOwnerKey();
  const [state, setState] = useState<ChessView | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async (init?: { body: unknown }) => {
      const res = await fetch('/api/chess', {
        method: init ? 'POST' : 'GET',
        cache: 'no-store',
        headers: {
          ...(init ? { 'Content-Type': 'application/json' } : {}),
          ...(ownerKey ? { 'x-chess-owner': ownerKey } : {}),
        },
        body: init ? JSON.stringify(init.body) : undefined,
      });
      const json = await res.json().catch(() => null);
      return { status: res.status, json };
    },
    [ownerKey],
  );

  const refresh = useCallback(async () => {
    try {
      const { status, json } = await request();
      if (status === 200) {
        setState(json as ChessView);
        setUnavailable(false);
      } else if (status === 503) setUnavailable(true);
    } catch {
      // Keep the last known board if the network blips.
    }
  }, [request]);

  useEffect(() => {
    let timer: number | undefined;
    const schedule = () => {
      window.clearInterval(timer);
      if (document.visibilityState === 'visible') {
        void refresh();
        timer = window.setInterval(refresh, POLL_MS);
      }
    };
    schedule();
    document.addEventListener('visibilitychange', schedule);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', schedule);
    };
  }, [refresh]);

  const send = useCallback(
    async (body: Record<string, unknown>, optimistic?: ChessView) => {
      if (!state) return false;
      setBusy(true);
      setError(null);
      if (optimistic) setState(optimistic);
      try {
        const { status, json } = await request({ body: { ...body, version: state.version } });
        if (status === 200) {
          setState(json as ChessView);
          return true;
        }
        if (status === 409) setError('Someone moved first. Board updated.');
        else if (status === 403) setError(json?.error === 'owner_only' ? 'Only Jatin can do that.' : 'Not your turn.');
        else if (status === 422) setError('That move isn’t legal.');
        else setError('Could not save the move. Try again.');
        if (json?.state) setState(json.state as ChessView);
        else await refresh();
        return false;
      } catch {
        setError('Network error. Try again.');
        await refresh();
        return false;
      } finally {
        setBusy(false);
      }
    },
    [request, refresh, state],
  );

  return { state, unavailable, busy, error, send };
}

const RESULT_TEXT = { owner: 'Jatin won', visitors: 'Visitors won', draw: 'Draw' } as const;

export default function ChessWidget({ className }: { className?: string }) {
  const { state, unavailable, busy, error, send } = useChessGame();
  const [selected, setSelected] = useState<Square | null>(null);
  const movesRef = useRef<HTMLOListElement>(null);

  const game = useMemo(() => (state ? new Chess(state.fen) : null), [state]);
  const myTurn = !!state && state.turn === state.youAre && !busy;
  const orientation = state?.youAre === 'owner' ? 'white' : 'black';
  const myColor = state?.youAre === 'owner' ? 'w' : 'b';

  useEffect(() => {
    setSelected(null);
    movesRef.current?.scrollTo({ top: movesRef.current.scrollHeight });
  }, [state?.version]);

  const targets = useMemo(() => {
    if (!game || !selected) return [];
    return game.moves({ square: selected, verbose: true }).map((m) => m.to);
  }, [game, selected]);

  const tryMove = (from: Square, to: Square) => {
    if (!state || !game || !myTurn) return false;
    const preview = new Chess(state.fen);
    let san: string;
    try {
      san = preview.move({ from, to, promotion: 'q' }).san;
    } catch {
      return false;
    }
    const other: Side = state.youAre === 'owner' ? 'visitors' : 'owner';
    void send(
      { action: 'move', from, to, promotion: 'q' },
      { ...state, fen: preview.fen(), moves: [...state.moves, san], lastMove: { from, to }, turn: other, inCheck: preview.inCheck() },
    );
    setSelected(null);
    return true;
  };

  const onSquareClick = (square: Square) => {
    if (!game || !myTurn) return;
    if (selected && targets.includes(square)) {
      tryMove(selected, square);
      return;
    }
    const piece = game.get(square);
    setSelected(piece && piece.color === myColor && square !== selected ? square : null);
  };

  if (unavailable || !state) {
    return unavailable ? null : (
      <WidgetCard className={className} icon={<GiChessKnight className="size-3.5" />} label="Chess">
        <div className="aspect-square w-full animate-pulse rounded-md bg-muted" />
      </WidgetCard>
    );
  }

  const squareStyles: Record<string, CSSProperties> = {};
  if (state.lastMove) {
    squareStyles[state.lastMove.from] = { background: 'rgba(250, 204, 21, 0.35)' };
    squareStyles[state.lastMove.to] = { background: 'rgba(250, 204, 21, 0.45)' };
  }
  if (selected) squareStyles[selected] = { background: 'rgba(37, 99, 235, 0.35)' };
  for (const t of targets) {
    const capture = !!game?.get(t as Square);
    squareStyles[t] = capture
      ? { boxShadow: 'inset 0 0 0 3px rgba(37, 99, 235, 0.55)' }
      : { backgroundImage: 'radial-gradient(circle, rgba(37,99,235,0.5) 22%, transparent 24%)' };
  }
  if (state.inCheck && game) {
    const kingSquare = game
      .board()
      .flat()
      .find((p) => p?.type === 'k' && p.color === game.turn())?.square;
    if (kingSquare) squareStyles[kingSquare] = { background: 'radial-gradient(circle, rgba(220,38,38,0.7) 30%, transparent 75%)' };
  }

  const youLabel = state.youAre === 'owner' ? 'You (Jatin)' : 'You';
  const status = myTurn
    ? `${youLabel}: your move${state.inCheck ? ' · check!' : ''}`
    : busy
      ? 'Saving move…'
      : state.turn === 'owner'
        ? 'Waiting for Jatin to move…'
        : 'Waiting for a visitor to move…';

  const pairs: [string, string | undefined][] = [];
  for (let i = 0; i < state.moves.length; i += 2) pairs.push([state.moves[i], state.moves[i + 1]]);

  return (
    <WidgetCard
      className={className}
      icon={<GiChessKnight className="size-3.5 text-foreground/80" />}
      label="Jatin vs visitors"
      trailing={<span className="tracking-normal normal-case">#{state.gameNumber}</span>}
    >
      {/* Scoreboard */}
      <dl className="mb-2.5 grid grid-cols-3 overflow-hidden rounded-lg border text-center">
        {(
          [
            ['Jatin', state.records.owner],
            ['Visitors', state.records.visitors],
            ['Draws', state.records.draws],
          ] as const
        ).map(([label, value], i) => (
          <div key={label} className={cn('py-1', i > 0 && 'border-l')}>
            <dd className="text-sm leading-tight font-bold tabular-nums">{value}</dd>
            <dt className="text-[9px] tracking-wide text-muted-foreground uppercase">{label}</dt>
          </div>
        ))}
      </dl>

      <div className={cn('overflow-hidden rounded-md ring-1 ring-black/10', myTurn && 'ring-2 ring-sky-400/70')}>
        <Chessboard
          id="portfolio-chess"
          position={state.fen}
          boardWidth={BOARD_WIDTH}
          boardOrientation={orientation}
          arePiecesDraggable={myTurn}
          isDraggablePiece={({ piece }) => myTurn && piece[0] === myColor}
          onPieceDrop={(from, to) => tryMove(from as Square, to as Square)}
          onSquareClick={(sq) => onSquareClick(sq as Square)}
          autoPromoteToQueen
          animationDuration={200}
          customSquareStyles={squareStyles}
          customLightSquareStyle={{ backgroundColor: '#f4f4f5' }}
          customDarkSquareStyle={{ backgroundColor: '#b8bcc6' }}
          showBoardNotation={false}
        />
      </div>

      <p className={cn('mt-2 text-xs font-medium', myTurn ? 'text-sky-700 dark:text-sky-400' : 'text-muted-foreground')} aria-live="polite">
        {status}
      </p>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-[11px] text-red-600"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Move record for the current game */}
      <ol
        ref={movesRef}
        className="mt-2 max-h-20 overflow-y-auto rounded-md bg-muted/60 px-2 py-1.5 font-mono text-[10px] leading-relaxed"
        aria-label="Moves this game"
      >
        {pairs.length === 0 ? (
          <li className="text-muted-foreground">No moves yet. Jatin (white) starts.</li>
        ) : (
          pairs.map(([w, b], i) => (
            <li key={i} className="grid grid-cols-[1.75rem_1fr_1fr]">
              <span className="text-muted-foreground">{i + 1}.</span>
              <span>{w}</span>
              <span>{b ?? ''}</span>
            </li>
          ))
        )}
      </ol>

      {state.lastResult && (
        <p className="mt-2 text-[10px] leading-snug text-muted-foreground">
          Last game: <span className="font-medium text-foreground">{RESULT_TEXT[state.lastResult.winner]}</span> by{' '}
          {state.lastResult.reason} in {state.lastResult.moves} moves
        </p>
      )}

      {state.youAre === 'owner' && (
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Reset the current game? The scoreboard is kept.')) void send({ action: 'reset' });
          }}
          className="mt-2 inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-3" /> Reset game (owner)
        </button>
      )}
    </WidgetCard>
  );
}
