const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Postgres throws a hard error (not a friendly "no rows") when a uuid column
 * is queried with a malformed value. Any route param plugged into a `uuid`
 * WHERE clause must be checked with this first, or a mistyped/stale URL
 * (deleted project, old bookmark) crashes with a 500 instead of a 404.
 */
export function isValidUuid(value: string): boolean {
  return UUID_RE.test(value);
}
