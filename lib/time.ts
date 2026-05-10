const STORAGE_KEY = 'whatsaiup_tz_offset';

export function getTimeZoneOffset(): number {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) {
    const parsed = parseInt(stored, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return new Date().getTimezoneOffset();
}

export function setTimeZoneOffset(minutes: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, minutes.toString());
  console.log(`[Timezone] Offset set to ${minutes} minutes (${minutes > 0 ? 'behind' : 'ahead of'} UTC)`);
}

export function formatMessageTime(timestamp: number): string {
  const offsetMs = getTimeZoneOffset() * 60 * 1000;
  const localDate = new Date(timestamp - offsetMs);
  const hours = localDate.getUTCHours().toString().padStart(2, '0');
  const minutes = localDate.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatShortDate(timestamp: number): string {
  const offsetMs = getTimeZoneOffset() * 60 * 1000;
  const localDate = new Date(timestamp - offsetMs);
  return localDate.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatWeekday(timestamp: number): string {
  const offsetMs = getTimeZoneOffset() * 60 * 1000;
  const localDate = new Date(timestamp - offsetMs);
  return localDate.toLocaleDateString([], {
    weekday: 'long',
    timeZone: 'UTC',
  });
}

export function getDateLabel(timestamp: number, t: (key: string) => string): string {
  const diffDays = getDiffDays(timestamp);

  if (diffDays === 0) return t('today');
  if (diffDays === 1) return t('yesterday');
  return formatShortDate(timestamp);
}

export function getDiffDays(timestamp: number): number {
  const offsetMs = getTimeZoneOffset() * 60 * 1000;
  const localNow = new Date(Date.now() - offsetMs);
  const localDate = new Date(timestamp - offsetMs);

  const today = Date.UTC(localNow.getUTCFullYear(), localNow.getUTCMonth(), localNow.getUTCDate());
  const msgDay = Date.UTC(localDate.getUTCFullYear(), localDate.getUTCMonth(), localDate.getUTCDate());
  return Math.round((today - msgDay) / (1000 * 60 * 60 * 24));
}
