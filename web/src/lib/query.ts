export function buildQuery(params: object): string {
  const search = new URLSearchParams();
   for (const [key, value] of Object.entries(params)) {
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      if (item === undefined || item === null) continue;
      const text = String(item).trim();
      if (text !== "") search.append(key, text);
    }
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}