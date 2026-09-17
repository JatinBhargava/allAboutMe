import { useEffect, useState } from 'react';

// en-US keeps the time as "10:42:07 PM" (uppercase AM/PM) for every visitor.
const timeFormat = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
});

function zoneName(date: Date, locale?: string) {
  return new Intl.DateTimeFormat(locale, { timeZoneName: 'short' })
    .formatToParts(date)
    .find((p) => p.type === 'timeZoneName')?.value;
}

// Each English locale only names its own region's zones (en-US → EDT, en-IN → IST, en-GB → BST).
const ZONE_LOCALES = ['en-US', 'en-IN', 'en-GB', 'en-AU'];

/** Short zone name like "EDT" or "IST", falling back to an offset like "GMT+5:30". */
function timeZoneLabel(date: Date) {
  let fallback: string | undefined;
  for (const locale of ZONE_LOCALES) {
    const name = zoneName(date, locale);
    if (name && !/^(GMT|UTC)[+-]/.test(name)) return name;
    fallback ??= name;
  }
  return fallback;
}

/** Visitor's local time, updated every second, e.g. "10:42:07 PM IST". */
export default function LiveClock({ className }: { className?: string }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer: number;
    const tick = () => {
      const date = new Date();
      setNow(date);
      // Align to the start of the next second so the display doesn't drift.
      timer = window.setTimeout(tick, 1000 - date.getMilliseconds());
    };
    timer = window.setTimeout(tick, 1000 - new Date().getMilliseconds());
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <time dateTime={now.toISOString()} className={className}>
      {timeFormat.format(now)} {timeZoneLabel(now)}
    </time>
  );
}
