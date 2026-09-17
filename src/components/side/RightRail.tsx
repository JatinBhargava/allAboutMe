import { lazy, Suspense } from 'react';
import SketchPad from '@/components/sketchpad/SketchPad';
import { AtlasAd, LatestTripCard } from './TripCards';
import QuestionCard from './QuestionCard';

// chess.js + the board are sizeable, so they load in their own chunk.
const ChessWidget = lazy(() => import('./ChessWidget'));

/**
 * Right gutter: doodle pad, question of the day, chess, latest trip and the Atlas ad.
 * `inline` (stacked below the content) leaves the trip to the left rail.
 */
export default function RightRail({ className, inline = false }: { className?: string; inline?: boolean }) {
  return (
    <aside aria-label="Play" className={className}>
      <div className="flex flex-col gap-5">
        <SketchPad />
        <QuestionCard />
        <Suspense fallback={null}>
          <ChessWidget />
        </Suspense>
        {!inline && <LatestTripCard />}
        <AtlasAd />
      </div>
    </aside>
  );
}
