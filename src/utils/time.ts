export function offsetToDate(offsetHours: number): Date {
  const now = new Date();
  const offsetMs = offsetHours * 60 * 60 * 1000;
  return new Date(now.getTime() + offsetMs);
}

export function formatOffsetLabel(offsetHours: number): string {
  if (offsetHours === 0) return 'Now';
  const sign = offsetHours > 0 ? '+' : '';
  return `${sign}${offsetHours}h`; 
}

export function buildTimeWindow(target: Date, backHours = 24, forwardHours = 6) {
  const start = new Date(target.getTime() - backHours * 60 * 60 * 1000);
  const end = new Date(target.getTime() + forwardHours * 60 * 60 * 1000);
  return { start, end };
}

export function formatRangeForDisplay(start: Date, end: Date): string {
  const fmt = (d: Date) => d.toISOString().replace(/:00\.000Z$/, 'Z');
  return `${fmt(start)} → ${fmt(end)}`;
}
