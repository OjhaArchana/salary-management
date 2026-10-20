export function toggleValue(selected: string[], value: string): string[] {
  return selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value];
}

export function triggerLabel(label: string, selected: string[]): string {
  if (selected.length === 0) return label;
  if (selected.length === 1) return `${label}: ${selected[0]}`;
  return `${label} (${selected.length})`;
}

export function filterBySearch(options: string[], term: string): string[] {
  const needle = term.trim().toLowerCase();
  return needle ? options.filter((option) => option.toLowerCase().includes(needle)) : options;
}