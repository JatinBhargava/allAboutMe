import SpotifyWidget from './SpotifyWidget';
import LiverpoolCard from './LiverpoolCard';
import { CodingCard, ReadingCard, useActivity, WatchedCard } from './ActivityCards';

/** Left gutter: what I'm listening to, Liverpool's next match, reading, watching and coding. */
export default function LeftRail({ className }: { className?: string }) {
  const activity = useActivity();
  return (
    <aside aria-label="What I'm up to" className={className}>
      <div className="flex flex-col gap-5">
        <SpotifyWidget />
        <LiverpoolCard />
        {activity?.reading && <ReadingCard book={activity.reading} />}
        {activity?.watched && <WatchedCard film={activity.watched} />}
        {activity?.coding && <CodingCard coding={activity.coding} />}
      </div>
    </aside>
  );
}
