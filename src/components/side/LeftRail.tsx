import SpotifyWidget from './SpotifyWidget';
import LiverpoolCard from './LiverpoolCard';
import { CodingCard, ReadingCard, useActivity, WatchedCard } from './ActivityCards';
import { LatestTripCard } from './TripCards';

/**
 * Left gutter: what I'm listening to, Liverpool's next match, reading, watching and coding.
 * `inline` (stacked below the content) also shows the latest trip, under the film.
 */
export default function LeftRail({ className, inline = false }: { className?: string; inline?: boolean }) {
  const activity = useActivity();
  return (
    <aside aria-label="What I'm up to" className={className}>
      <div className="flex flex-col gap-5">
        <SpotifyWidget />
        <LiverpoolCard />
        {activity?.reading && <ReadingCard book={activity.reading} />}
        {activity?.watched && <WatchedCard film={activity.watched} />}
        {inline && <LatestTripCard />}
        {activity?.coding && <CodingCard coding={activity.coding} />}
      </div>
    </aside>
  );
}
