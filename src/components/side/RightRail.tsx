import { lazy, Suspense } from 'react';
import SketchPad from '@/components/sketchpad/SketchPad';
import { AtlasAd, LatestTripCard } from './TripCards';
import QuestionCard from './QuestionCard';

// chess.js + the board are sizeable, so they load in their own chunk.
const ChessWidget = lazy(() => import('./ChessWidget'));

/** Right gutter: doodle pad, question of the day, chess, latest trip and the Atlas ad. */
export default function RightRail({ className }: { className?: string }) {
  return (
    <aside aria-label="Play" className={className}>
      <div className="flex flex-col gap-5">
        <SketchPad />
        <QuestionCard />
        <Suspense fallback={null}>
          <ChessWidget />
        </Suspense>
        <LatestTripCard />
        <AtlasAd />
      </div>
    </aside>
  );
}
