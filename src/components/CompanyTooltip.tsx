import { useRef, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CompanyTooltipProps {
  name: string;
  about: string;
}

/** Company name with a short blurb on hover/focus, or on tap for touch screens. */
export default function CompanyTooltip({ name, about }: CompanyTooltipProps) {
  const [open, setOpen] = useState(false);
  const touching = useRef(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Radix tooltips are hover/focus only. For taps we skip Radix's own handlers
  // (it ignores events that are already defaultPrevented) and toggle ourselves.
  return (
    <Tooltip open={open} onOpenChange={setOpen} delayDuration={150}>
      <TooltipTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          onPointerDown={(e) => {
            touching.current = e.pointerType !== 'mouse';
            if (touching.current) e.preventDefault();
          }}
          onFocus={(e) => {
            if (touching.current) e.preventDefault();
          }}
          onClick={(e) => {
            if (!touching.current) return;
            e.preventDefault();
            touching.current = false;
            setOpen((o) => !o);
          }}
          className="cursor-help rounded-sm underline decoration-dotted decoration-muted-foreground/60 underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground"
        >
          {name}
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={6}
        collisionPadding={16}
        // A tap on the trigger is handled by its onClick toggle, not as an outside dismiss.
        onPointerDownOutside={(e) => {
          if (triggerRef.current?.contains(e.target as Node)) e.preventDefault();
        }}
        className="max-w-[260px] text-pretty leading-snug"
      >
        {about}
      </TooltipContent>
    </Tooltip>
  );
}
