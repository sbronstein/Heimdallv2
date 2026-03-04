export function parseArrayParam(param: string | null): string[] | null {
  if (!param) return null;
  return param
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseCursor(param: string | null): Date | null {
  if (!param) return null;
  const date = new Date(param);
  return isNaN(date.getTime()) ? null : date;
}

export function parseLimit(param: string | null, max = 100): number {
  const limit = parseInt(param || '20', 10);
  if (isNaN(limit) || limit < 1) return 20;
  return Math.min(limit, max);
}
