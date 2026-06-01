/**
 * Returns a Salesforce business account id, or null if missing/invalid.
 * URL query bugs often produce the literal strings "null" / "undefined".
 */
export function normalizeBusCode(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const t = String(raw).trim();
  if (!t || t === "null" || t === "undefined") return null;
  return t;
}

export function busCodeFromSearchParams(searchParams: URLSearchParams): string | null {
  const raw =
    searchParams.get("buss-code") ||
    searchParams.get("bus-code") ||
    searchParams.get("bus_code") ||
    searchParams.get("buss_code");
  return normalizeBusCode(raw);
}
