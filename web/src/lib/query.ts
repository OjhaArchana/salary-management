export function buildQuery(params: object): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (text !== "") search.set(key, text);
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}