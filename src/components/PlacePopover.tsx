import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { places } from '@/data/resume';

/** Renders a location; if we have a photo for it, clicking opens it in a popover. */
export default function PlacePopover({ name }: { name: string }) {
  const place = places[name];
  const [loaded, setLoaded] = useState(false);
  if (!place) return <>{name}</>;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-sm text-foreground/80 underline decoration-dotted decoration-muted-foreground/60 underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground data-[state=open]:text-foreground"
        >
          <MapPin className="size-3.5" />
          {name}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" collisionPadding={16} className="w-[min(340px,calc(100vw-2rem))] overflow-hidden p-0">
        <div className="relative aspect-[4/3] bg-muted">
          <img
            src={place.image}
            alt={place.alt}
            onLoad={() => setLoaded(true)}
            className={`size-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>
        <div className="space-y-1 px-3 py-2.5">
          <p className="text-sm font-medium">{place.caption}</p>
          <p className="text-[11px] text-muted-foreground">
            Photo:{' '}
            <a href={place.credit.source} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-foreground">
              {place.credit.author}
            </a>
            , {place.credit.license}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
